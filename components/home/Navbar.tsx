import Link from 'next/link'

export function NavBar() {
    return (
        <nav className="flex justify-end items-center px-10 py-5 border-gray-700">
            <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                Our Story
            </button>
        </nav>
    )
} 