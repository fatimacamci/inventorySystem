

import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import type { Category, Item } from "../types"
import { DEFAULT_CATEGORIES } from "../types"
import { apiGet, apiSend } from "../api"

const API_BASE = import.meta.env.VITE_API_URL


export default function Inventory() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
    const [items, setItems] = useState<Item[]>([])

    const [showPopup, setShowPopup] = useState(false)
    const [newItem, setNewItem] = useState({
        category: null as any,
        itemName: "",
        quantity: 0,
        notes: "",
    })
    const [editingId, setEditingId] = useState<number | null>(null)

    // For checkout popup
    const [checkoutItem, setCheckoutItem] = useState<Item | null>(null)
    const [checkoutQty, setCheckoutQty] = useState(1)
    const [checkoutUser, setCheckoutUser] = useState<number | null>(null)
    const [users, setUsers] = useState<{ id: number; first_name: string; last_name: string }[]>([])
    const [checkoutError, setCheckoutError] = useState<string | null>(null)

    // Fetch items from backend on mount
    // Fetch categories and items from backend on mount
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [catData, itemData] = await Promise.all([
                    apiGet("/categories/"),
                    apiGet("/items/")
                ])
                setCategories(catData)
                // Map backend fields to frontend fields and attach full category object
                const itemsWithCategory = itemData.map((item: any) => {
                    const cat = catData.find((c: any) => c.id === item.category_id)
                    return {
                        ...item,
                        itemName: item.item_name,
                        pickupDate: item.pickup_date,
                        returnDate: item.return_date,
                        category: cat,
                    }
                })
                setItems(itemsWithCategory)
            } catch (err) {
                // fallback: do nothing
            }
        }
        fetchAll()
    }, [])

    const saveItem = async () => {
        if (!newItem.itemName || typeof newItem.quantity !== "number" || !newItem.category) return

        // Use the full category object from categories
        const selectedCat = categories.find((c) => c.id === (newItem.category as any).id || c.val === (newItem.category as any).val)
        if (!selectedCat) return

        if (editingId != null) {
            // update existing (local only)
            setItems(items.map(i => i.id === editingId ? {
                ...i,
                category: selectedCat,
                itemName: newItem.itemName || i.itemName,
                quantity: newItem.quantity || i.quantity,
                notes: newItem.notes ?? i.notes,
            } : i))
        } else {
            // add new: persist to backend
            try {
                const payload = {
                    item_name: newItem.itemName,
                    category_id: selectedCat.id,
                    quantity: newItem.quantity,
                    notes: newItem.notes,
                }
                const created = await apiSend("POST", "/items/", payload)
                // Map backend fields to frontend fields and attach category
                setItems([
                    ...items,
                    {
                        ...created,
                        itemName: created.item_name,
                        pickupDate: created.pickup_date,
                        returnDate: created.return_date,
                        category: selectedCat,
                    }
                ])
            } catch (err) {
                alert("Failed to add item: " + (err as any).message)
            }
        }

        // reset state
        setShowPopup(false)
        setEditingId(null)
        setNewItem({ category: categories[0], itemName: "", quantity: 0, notes: "" })
    }

    const openEdit = (id: number) => {
        const item = items.find(i => i.id === id)
        if (!item) return
        setEditingId(id)
        setNewItem({ ...item })
        setShowPopup(true)
    }

    const deleteItem = (id: number) => {
        if (!confirm("Delete this item?")) return
        setItems(items.filter(i => i.id !== id))
    }

    const closePopup = () => {
        setShowPopup(false)
        setEditingId(null)
        setNewItem({
            category: DEFAULT_CATEGORIES[0] as Category,
            itemName: "",
            quantity: 0,
            notes: "",
        })
    }

    // ---- NEW: check-out helper with user selection ----
    const openCheckout = async (item: Item) => {
        setCheckoutError(null)
        setCheckoutItem(item)
        setCheckoutQty(1)
        // Fetch users if not already loaded
        if (users.length === 0) {
            try {
                const data = await apiGet("/users/")
                setUsers(data)
            } catch (err) {
                setUsers([])
            }
        }
        setCheckoutUser(null)
    }

    const handleCheckoutSubmit = async () => {
        if (!checkoutItem || !checkoutUser) {
            setCheckoutError("Please select a user.")
            return
        }
        if (!Number.isFinite(checkoutQty) || checkoutQty <= 0 || checkoutQty > checkoutItem.quantity) {
            setCheckoutError("Invalid quantity.")
            return
        }
        const token = localStorage.getItem("admin_token")
        if (!token) {
            setCheckoutError("Not logged in as admin.")
            return
        }
        try {
            setCheckoutError(null)
            const today = new Date()
            const pickupDateStr = today.toISOString().slice(0, 10)
            // Calculate return date (one week after pickup)
            const returnDate = new Date(today)
            returnDate.setDate(today.getDate() + 7)
            const returnDateStr = returnDate.toISOString().slice(0, 10)
            // Find the correct category_id from categories
            let category_id = undefined
            if (checkoutItem.category && (checkoutItem.category as any).id) {
                category_id = (checkoutItem.category as any).id
            } else {
                // fallback: match by value
                const cat = categories.find(c => c.val === (checkoutItem.category as any).val)
                if (cat) category_id = cat.id
            }
            if (!category_id) {
                setCheckoutError("Could not determine category ID for this item.")
                return
            }
            // POST to /checked-out/
            const checkedOutPayload = {
                item_name: checkoutItem.itemName,
                category_id,
                quantity: checkoutQty,
                pickup_date: pickupDateStr,
                return_date: returnDateStr,
                dispenser_id: 1, // TODO: support real dispenser
                receiver_id: checkoutUser,
                notes: checkoutItem.notes,
            }
            const postRes = await fetch(`${API_BASE}/checked-out/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(checkedOutPayload),
            })
            if (!postRes.ok) {
                const body = await postRes.json().catch(() => ({}))
                setCheckoutError(body.detail || "Failed to check out item")
                return
            }
            // Update inventory
            const remaining = checkoutItem.quantity - checkoutQty
            if (remaining > 0) {
                const putPayload = {
                    item_name: checkoutItem.itemName,
                    category_id,
                    quantity: remaining,
                    notes: checkoutItem.notes,
                }
                const putRes = await fetch(`${API_BASE}/items/${checkoutItem.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(putPayload),
                })
                if (!putRes.ok) {
                    const body = await putRes.json().catch(() => ({}))
                    setCheckoutError(body.detail || "Failed to update inventory")
                    return
                }
            } else {
                const delRes = await fetch(`${API_BASE}/items/${checkoutItem.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (!delRes.ok) {
                    const body = await delRes.json().catch(() => ({}))
                    setCheckoutError(body.detail || "Failed to delete item")
                    return
                }
            }
            // Update UI
            setItems(prev =>
                remaining > 0
                    ? prev.map(i => i.id === checkoutItem.id ? { ...i, quantity: remaining } : i)
                    : prev.filter(i => i.id !== checkoutItem.id)
            )
            setCheckoutItem(null)
        } catch (err: any) {
            setCheckoutError(err.message ?? "Failed to check out item")
        }
    }

    return (
        <div className="um-wrapper">
            <header className="uh-header um-header">
                <div className="um-header-left">
                    <h1 className="uh-title">Detachment 825 Inventory System</h1>
                    <h2 className="um-subtitle">Inventory</h2>
                </div>

                <button
                    className="uh-navigate-btn ah-logout um-back-btn"
                    onClick={() => navigate("/admin/")}
                >
                    Back
                </button>
            </header>

            <main className="um-main">
                <div className="um-table-container">
                    <table className="um-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Notes</th>
                                <th>Modify</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.category.val}</td>
                                    <td>{item.itemName}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.notes}</td>
                                    <td>
                                        <button
                                            className="um-edit-btn"
                                            onClick={() => openEdit(item.id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="um-edit-btn"
                                            onClick={() => deleteItem(item.id)}
                                            style={{ marginLeft: 8 }}
                                        >
                                            Delete
                                        </button>
                                        {/* NEW: per-row Check Out */}
                                        <button
                                            className="um-edit-btn"
                                            onClick={() => openCheckout(item)}
                                            style={{ marginLeft: 8 }}
                                        >
                                            Check Out
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button
                            className="uh-navigate-btn um-add-btn"
                            onClick={() => {
                                setEditingId(null)
                                setShowPopup(true)
                            }}
                        >
                            Add New Item
                        </button>
                        <button
                            className="uh-navigate-btn um-add-btn"
                            onClick={() => {
                                navigate("/admin/checked-out")
                            }}
                        >
                            View Checked Out
                        </button>
                    </div>
                </div>
            </main>

            {/* Add/Edit Item Popup */}
            {showPopup && (
                <div className="um-popup">
                    <h3>{editingId ? "Edit Item" : "Add New Item"}</h3>
                    <label>
                        Category:
                        <select
                            value={newItem.category ? (newItem.category as any).id : ""}
                            onChange={(e) => {
                                const cat = categories.find((c) => c.id === Number(e.target.value))
                                setNewItem({ ...newItem, category: cat || null })
                            }}
                            style={{ marginLeft: 8 }}
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.val}
                                </option>
                            ))}
                        </select>
                        {/* quick add button: prompt for new category, append to local categories and select it */}
                        <button
                            type="button"
                            title="Add category"
                            onClick={async () => {
                                const name = prompt("New category name")
                                if (!name) return
                                if (categories.some((c) => c.val === name.trim())) {
                                    alert("Category already exists")
                                    return
                                }
                                try {
                                    const created = await apiSend("POST", "/categories/", { val: name.trim() })
                                    // Refetch categories from backend to get real id
                                    const updated = await apiGet("/categories/")
                                    setCategories(updated)
                                    setNewItem({ ...newItem, category: created })
                                } catch (err) {
                                    alert("Failed to add category: " + (err as any).message)
                                }
                            }}
                            style={{
                                marginLeft: 4,
                                padding: "4px 8px",
                                cursor: "pointer",
                            }}
                        >
                            +
                        </button>
                    </label>
                    <label>
                        Item Name:
                        <input
                            value={newItem.itemName || ""}
                            onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                        />
                    </label>
                    <label>
                        Quantity:
                        <input
                            type="number"
                            value={String(newItem.quantity ?? 0)}
                            min={0}
                            onChange={(e) =>
                                setNewItem({ ...newItem, quantity: Number(e.target.value) })
                            }
                        />
                    </label>
                    <label>
                        Notes:
                        <textarea
                            value={newItem.notes || ""}
                            onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                            rows={3}
                            style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }}
                        />
                    </label>
                    <div className="um-popup-buttons">
                        <button onClick={saveItem}>{editingId ? "Save" : "Add"}</button>
                        <button onClick={closePopup}>Cancel</button>
                    </div>
                </div>
            )}
            {/* Checkout Popup */}
            {checkoutItem && (
                <div className="um-popup">
                    <h3>Check Out Item</h3>
                    <div style={{ marginBottom: 12 }}>
                        <b>{checkoutItem.itemName}</b> (Available: {checkoutItem.quantity})
                    </div>
                    <label>
                        Quantity:
                        <input
                            type="number"
                            min={1}
                            max={checkoutItem.quantity}
                            value={checkoutQty}
                            onChange={e => setCheckoutQty(Number(e.target.value))}
                            style={{ marginLeft: 8 }}
                        />
                    </label>
                    <label style={{ display: "block", marginTop: 12 }}>
                        User:
                        <select
                            value={checkoutUser ?? ""}
                            onChange={e => setCheckoutUser(Number(e.target.value))}
                            style={{ marginLeft: 8 }}
                        >
                            <option value="">Select user</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.first_name} {u.last_name}
                                </option>
                            ))}
                        </select>
                    </label>
                    {checkoutError && <div style={{ color: "crimson", marginTop: 8 }}>{checkoutError}</div>}
                    <div className="um-popup-buttons" style={{ marginTop: 16 }}>
                        <button onClick={handleCheckoutSubmit}>Check Out</button>
                        <button onClick={() => setCheckoutItem(null)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    )
}

