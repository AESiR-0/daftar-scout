"use client"
import { usePathname } from "next/navigation"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSearch } from "@/lib/context/search-context"

const filterOptions = {
  scout: [
    { value: 'all', label: 'All scout' },
    { value: 'planning', label: 'Planning' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
  ],
  meetings: [
    { value: 'all', label: 'All Meetings' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  incubation: [
    { value: 'all', label: 'All scout' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
  ],
  daftar: [
    { value: 'all', label: 'All Daftar' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
  ],
  'deal-board': [
    { value: 'all', label: 'All Pitches' },
    { value: 'planning', label: 'Planning' },
    { value: 'pitched', label: 'Pitched' },
    { value: 'offer', label: 'Offer Received' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'cancelled', label: 'Deal Cancelled' },
  ],
  collaboration: [
    { value: 'all', label: 'All Collaboration' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
  ],
  document: [
    { value: 'all', label: 'All Document' },
    { value: 'pdf', label: 'PDF Files' },
    { value: 'doc', label: 'Word Files' },
    { value: 'other', label: 'Other Files' },
  ],
}

const searchPlaceholders = {
  scout: 'Search scout...',
  meetings: 'Search meetings...',
  incubation: 'Search incubation scout...',
  daftar: 'Search Daftar...',
  'deal-board': 'Search pitches...',
  collaboration: 'Search collaboration...',
  document: 'Search document...',
}

export function SearchAndFilter() {
  const pathname = usePathname()
  const { searchQuery, setSearchQuery, filterValue, setFilterValue } = useSearch()

  // Get the path segments
  const segments = pathname.split('/')

  // Determine the key for filter options
  let filterKey = segments[1] // Default to first segment

  // Handle studio paths
  if (segments[1] === 'studio') {
    filterKey = segments[2] // Use the second segment for studio routes
  }

  // If the current page doesn't have search/filter options, don't render
  if (!filterOptions[filterKey as keyof typeof filterOptions]) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholders[filterKey as keyof typeof searchPlaceholders] || 'Search...'}
          className="pl-8 w-[250px] h-9"
        />
      </div>
      <Select
        value={filterValue}
        onValueChange={setFilterValue}
      >
        <SelectTrigger className="w-fit gap-2 h-9">
          <Filter className="h-4 w-4" />
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          {filterOptions[filterKey as keyof typeof filterOptions]?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 