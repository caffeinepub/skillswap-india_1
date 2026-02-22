import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useListUsers } from "../hooks/useQueries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, SortAsc, Loader2 } from "lucide-react";
import UserCard from "../components/UserCard";

const skillCategories = [
  "All Skills",
  "Technology",
  "Music & Arts",
  "Languages",
  "Academic",
  "Fitness",
  "Business",
  "Other",
];

export default function SearchPage() {
  const { identity, loginStatus, login } = useInternetIdentity();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Skills");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating");

  const { data: users, isLoading } = useListUsers();
  const isLoggedIn = loginStatus === "success" && identity;

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users;

    // Search filter (by name or skills)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.skillsOffered.some((s) =>
            s.name.toLowerCase().includes(query)
          ) ||
          user.skillsWanted.some((s) => s.name.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (locationFilter.trim()) {
      const locQuery = locationFilter.toLowerCase();
      filtered = filtered.filter((user) =>
        user.location.toLowerCase().includes(locQuery)
      );
    }

    // Sort
    if (sortBy === "rating") {
      filtered = [...filtered].sort(
        (a, b) => b.averageRating - a.averageRating
      );
    } else if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [users, searchQuery, locationFilter, sortBy]);

  if (!isLoggedIn && loginStatus !== "logging-in") {
    login();
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Search Skills</h1>
        <p className="text-lg text-muted-foreground">
          Find the perfect match for your skill exchange journey
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid md:grid-cols-12 gap-4 p-6 bg-card border-2 rounded-lg shadow-md">
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Location Filter */}
        <div className="md:col-span-3">
          <Input
            placeholder="Location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="md:col-span-2">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <div className="md:col-span-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSearchQuery("");
              setLocationFilter("");
              setSortBy("rating");
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {skillCategories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 font-mono hover:bg-primary/20 transition-colors"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}{" "}
            found
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user, idx) => (
              <UserCard key={idx} user={user} showActions />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
