# User Profile & Layout Architecture (AniList Inspired)

## Overview

The **User Profile Layout** is modeled after popular cinephile & media tracking dashboards (such as **AniList**). It features a full-width hero cover banner, an overlapping user avatar badge, a horizontal sub-navigation bar, and a responsive two-column layout with a left-hand filter sidebar and main content views.

---

# Visual Architecture & Structure

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Global App Header & Search Bar                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                         Full-Width Cover Banner                         │
│                                                                         │
│   ┌──────────┐                                                          │
│   │  Avatar  │  Display Name (@username)                                 │
└───┴──────────┴──────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────┐
│  Overview  │  Movie List  │  Favorites  │  Stats  │  Reviews  │ Settings│
└─────────────────────────────────────────────────────────────────────────┘
┌───────────────────────────┬─────────────────────────────────────────────┐
│      Filter Sidebar       │             Main Content View               │
│ ┌───────────────────────┐ │ ┌─────────────────────────────────────────┐ │
│ │ Search Movies Filter   │ │ │ View Mode Toggle: [Grid] [Detail] [List]│ │
│ │ Lists (Status Filters)│ │ └─────────────────────────────────────────┘ │
│ │ Genre Dropdown        │ │                                             │
│ │ Year Dropdown         │ │ Movie Cards / Rows with User Scores & Dates │
│ └───────────────────────┘ │                                             │
└───────────────────────────┴─────────────────────────────────────────────┘
```

---

# Component Hierarchy

- **`ProfileBanner.tsx`**: Full-width cover image/gradient with overlapping user avatar and username badge.
- **`ProfileNavBar.tsx`**: Full-width tab switcher (Overview, Movie List, Favorites, Stats, Reviews, Settings).
- **`ProfileSidebar.tsx`**: Left column containing search input, list category filters, and dropdown selectors for genre/year.
- **`MovieListTab.tsx`**: Movie list view supporting Grid `[:::]`, Detailed `[=]`, and Compact `[≡]` layout modes.
- **`ProfileOverviewTab.tsx`**: High-level overview with quick stats breakdown, favorite showcase, and recent activity.
- **`ProfileStatsTab.tsx`**: Visual distribution of user ratings (1–10) and favorite genres.
