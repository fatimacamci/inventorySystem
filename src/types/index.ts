export interface User {
    id: number
    firstName: string
    lastName: string
}

export interface Category {
    val: string
}

export const DEFAULT_CATEGORIES: Category[] = [
    { val: "Electronics" },
    { val: "Tools" },
    { val: "Medical" },
    { val: "Uniforms" },
    { val: "Misc" },
]

export interface Item {
    id: number
    dispenser?: User | null
    receiver?: User | null
    category: Category
    itemName: string
    pickupDate?: Date | null
    returnDate?: Date | null
    quantity: number
    notes: string
}