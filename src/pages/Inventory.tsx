import { useNavigate } from "react-router-dom"
import { useState } from "react"
import type { Category, Item } from "../types"
import { DEFAULT_CATEGORIES } from "../types"

export default function Inventory() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
    const [items, setItems] = useState<Item[]>([
        { id: 1, category: DEFAULT_CATEGORIES[0] as Category, itemName: "iPhone 17", "quantity": 5, notes: "Reserved for students only" },
        { id: 2, category: DEFAULT_CATEGORIES[2] as Category, itemName: "Bandaids", "quantity": 100, notes: "In case of emergency" },
    ])

    const [showPopup, setShowPopup] = useState(false)
    const [newItem, setNewItem] = useState({ 
        category: DEFAULT_CATEGORIES[0] as Category, 
        itemName: "",
        quantity: 0,
        notes: ""
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

    return (
        <div className="um-wrapper">
            <header className="uh-header um-header">
                <div className="um-header-left">
                    <h1 className="uh-title">Detachment 825 Inventory System</h1>
                    <h2 className="um-subtitle">Inventory</h2>
                </div>

                <button className="uh-navigate-btn ah-logout um-back-btn"
                    onClick={() => navigate("/admin/")}>
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
                                        <button className="um-edit-btn" 
                                            onClick={() => openEdit(item.id)}>Edit
                                        </button>
                                        <button
                                            className="um-edit-btn"
                                            onClick={() => deleteItem(item.id)}
                                            style={{ marginLeft: 8 }}
                                        >Delete
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
                                alert("work in progress!")
                            }}
                        >
                            Check Out Item
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
                            onChange={(e) => setNewItem({ ...newItem, category: { val: e.target.value } })}
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
                            onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
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
