import { useNavigate } from "react-router-dom"
import { useState } from "react"
import type { Category, Item } from "../types"
import { DEFAULT_CATEGORIES } from "../types"

export default function Inventory() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
    const [items, setItems] = useState<Item[]>([
        // dummy vals here
    ])

    return (
        <div className="um-wrapper">
            <header className="uh-header um-header">
                <div className="um-header-left">
                    <h1 className="uh-title">Detachment 825 Inventory System</h1>
                    <h2 className="um-subtitle">Currently Checked Out</h2>
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
                                <th>Name</th>
                                <th>Category</th>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Pickup Date</th>
                                <th>Return Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.receiver?.firstName} + {item.receiver?.lastName}</td>
                                    <td>{item.category.val}</td>
                                    <td>{item.itemName}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.pickupDate?.toDateString()}</td>
                                    <td>{item.returnDate?.toDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}
