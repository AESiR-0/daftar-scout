"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface BookmarkContextType {
    showBookmarked: boolean
    bookmarkedSlugs: Set<string>
    toggleFilter: () => void
    toggleBookmark: (slug: string) => void
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined)

export function BookmarkProvider({ children }: { children: ReactNode }) {
    const [showBookmarked, setShowBookmarked] = useState(false)
    const [bookmarkedSlugs, setBookmarkedSlugs] = useState<Set<string>>(new Set())

    // Load bookmarks from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('bookmarkedSlugs')
        if (stored) {
            setBookmarkedSlugs(new Set(JSON.parse(stored)))
        }
    }, [])

    // Save bookmarks to localStorage when changed
    useEffect(() => {
        localStorage.setItem('bookmarkedSlugs', JSON.stringify([...bookmarkedSlugs]))
    }, [bookmarkedSlugs])

    const toggleFilter = () => setShowBookmarked(prev => !prev)

    const toggleBookmark = (slug: string) => {
        setBookmarkedSlugs(prev => {
            const newBookmarks = new Set(prev)
            if (newBookmarks.has(slug)) {
                newBookmarks.delete(slug)
            } else {
                newBookmarks.add(slug)
            }
            return newBookmarks
        })
    }

    return (
        <BookmarkContext.Provider value={{
            showBookmarked,
            bookmarkedSlugs,
            toggleFilter,
            toggleBookmark
        }}>
            {children}
        </BookmarkContext.Provider>
    )
}

export function useBookmarks() {
    const context = useContext(BookmarkContext)
    if (context === undefined) {
        throw new Error('useBookmarks must be used within a BookmarkProvider')
    }
    return context
} 