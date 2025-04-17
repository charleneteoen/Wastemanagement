import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    type: "Collection",
    location: "Building A",
    date: "2023-04-01",
    time: "09:30 AM",
    weight: "120 kg",
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JD",
    },
  },
  {
    id: 2,
    type: "Processing",
    location: "Recycling Center",
    date: "2023-04-01",
    time: "11:45 AM",
    weight: "85 kg",
    user: {
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JS",
    },
  },
  {
    id: 3,
    type: "Collection",
    location: "Building B",
    date: "2023-04-02",
    time: "10:15 AM",
    weight: "95 kg",
    user: {
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "MJ",
    },
  },
  {
    id: 4,
    type: "Processing",
    location: "Recycling Center",
    date: "2023-04-02",
    time: "02:30 PM",
    weight: "140 kg",
    user: {
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SW",
    },
  },
  {
    id: 5,
    type: "Collection",
    location: "Building C",
    date: "2023-04-03",
    time: "09:00 AM",
    weight: "110 kg",
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JD",
    },
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div className="flex items-center" key={activity.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.type} - {activity.location}
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.date} at {activity.time} • {activity.weight}
            </p>
          </div>
          <div className="ml-auto font-medium">{activity.user.name}</div>
        </div>
      ))}
    </div>
  )
}
