import { useNavigate } from "react-router-dom"
import { useState } from "react"
import type { Category, Item } from "../types"
import { DEFAULT_CATEGORIES } from "../types"

const API_BASE = import.meta.env.VITE_API_URL

export default function Inventory() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
    const [items, setItems] = useState<Item[]>([
        { id: 1, category: DEFAULT_CATEGORIES[0] as Category, itemName: "iPhone 17", quantity: 5, notes: "Reserved for students only" },
        { id: 2, category: DEFAULT_CATEGORIES[2] as Category, itemName: "Bandaids", quantity: 100, notes: "In case of emergency" },
    ])

    const [showPopup, setShowPopup] = useState(false)
    const [newItem, setNewItem] = useState({
        category: DEFAULT_CATEGORIES[0] as Category,
        itemName: "",
        quantity: 0,
        notes: "",
    })
    const [editingId, setEditingId] = useState<number | null>(null)

    const saveItem = () => {
        if (!newItem.itemName || typeof newItem.quantity !== "number") return

        if (editingId != null) {
            // update existing
            setItems(items.map(i => i.id === editingId ? {
                ...i,
                category: newItem.category as Category,
                itemName: newItem.itemName || i.itemName,
                quantity: newItem.quantity || i.quantity,
                notes: newItem.notes ?? i.notes,
            } : i))
        } else {
            // add new
            const item: Item = {
                id: Date.now(),
                category: newItem.category as Category,
                itemName: newItem.itemName || "",
                quantity: newItem.quantity || 0,
                notes: newItem.notes || "",
            }
            setItems([...items, item])
        }

        // reset state
        setShowPopup(false)
        setEditingId(null)
        setNewItem({ category: DEFAULT_CATEGORIES[0] as Category, itemName: "", quantity: 0, notes: "" })
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

    // ---- NEW: check-out helper ----
    const handleCheckout = async (item: Item) => {
        const qtyStr = window.prompt("Quantity to check out:", "1")
        if (!qtyStr) return

        const qty = Number(qtyStr)
        if (!Number.isFinite(qty) || qty <= 0 || qty > item.quantity) {
            alert("Invalid quantity")
            return
        }

        const token = localStorage.getItem("admin_token")
        if (!token) {
            alert("Not logged in as admin")
            return
        }

        try {
            const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

            // 1) POST to /checked-out/
            const checkedOutPayload = {
                item_name: item.itemName,
                category_id: (item.category as any).id ?? 1,
                quantity: qty,
                pickup_date: today,
                return_date: today, // minimal version
                dispenser_id: 1,
                receiver_id: 1,
                notes: "",
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
                console.error("POST /checked-out/ failed", postRes.status, body)
                throw new Error(body.detail || "Failed to check out item")
            }

            // 2) PUT or DELETE /items/{id}
            const remaining = item.quantity - qty

            if (remaining > 0) {
                const putPayload = {
                    item_name: item.itemName,
                    category_id: (item.category as any).id ?? 1,
                    quantity: remaining,
                    notes: item.notes,
                }

                const putRes = await fetch(`${API_BASE}/items/${item.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(putPayload),
                })

                if (!putRes.ok) {
                    const body = await putRes.json().catch(() => ({}))
                    console.error("PUT /items failed", putRes.status, body)
                    throw new Error(body.detail || "Failed to update inventory")
                }
            } else {
                const delRes = await fetch(`${API_BASE}/items/${item.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (!delRes.ok) {
                    const body = await delRes.json().catch(() => ({}))
                    console.error("DELETE /items failed", delRes.status, body)
                    throw new Error(body.detail || "Failed to delete item")
                }
            }

            // 3) Update local UI to match
            setItems(prev =>
                remaining > 0
                    ? prev.map(i => i.id === item.id ? { ...i, quantity: remaining } : i)
                    : prev.filter(i => i.id !== item.id)
            )
        } catch (err: any) {
            console.error(err)
            alert(err.message ?? "Failed to check out item")
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
                                            onClick={() => handleCheckout(item)}
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
                            value={(newItem.category as Category)?.val || ""}
                            onChange={(e) =>
                                setNewItem({ ...newItem, category: { val: e.target.value } })
                            }
                            style={{ marginLeft: 8 }}
                        >
                            {categories.map((cat) => (
                                <option key={cat.val} value={cat.val}>
                                    {cat.val}
                                </option>
                            ))}
                        </select>
                        {/* quick add button: prompt for new category, append to local categories and select it */}
                        <button
                            type="button"
                            title="Add category"
                            onClick={() => {
                                const name = prompt("New category name")
                                if (!name) return
                                if (categories.some((c) => c.val === name.trim())) {
                                    alert("Category already exists")
                                    return
                                }
                                const newCat: Category = { val: name.trim() }
                                setCategories((s) => [...s, newCat])
                                setNewItem({ ...newItem, category: newCat })
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
        </div>
    )
}

