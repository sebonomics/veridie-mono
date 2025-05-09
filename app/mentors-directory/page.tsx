"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/star-rating"
import Link from "next/link"

interface Mentor {
  id: string
  title: string | null
  university: string | null
  bio: string | null
  rating: number
  review_count: number
  profile_image_url: string | null
  profile: {
    name: string
    email: string
    avatar: string | null
  }
  services: {
    name: string
    price: number
  }[]
  awards?: {
    title: string
    issuer: string
    year?: string
  }[]
}

export default function MentorsDirectoryPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mentorImages, setMentorImages] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchMentors() {
      try {
        setLoading(true)

        // Fetch mentors with their profiles and services
        const { data, error } = await supabase
          .from("mentors")
          .select(`
            id,
            title,
            university,
            bio,
            rating,
            review_count,
            profile_image_url,
            profile:profiles(name, email, avatar),
            services(name, price),
            awards(title, issuer, year)
          `)
          .order("rating", { ascending: false })

        if (error) {
          throw error
        }

        // Transform the data to match our interface
        const transformedData =
          data?.map((mentor) => ({
            ...mentor,
            profile: mentor.profile,
            services: mentor.services || [],
            awards: mentor.awards || [],
          })) || []

        console.log(
          "Fetched mentors with image data:",
          transformedData.map((m) => ({
            id: m.id,
            name: m.profile?.name,
            profile_image_url: m.profile_image_url,
            avatar: m.profile?.avatar,
          })),
        )

        setMentors(transformedData)

        // Process image URLs on the client side
        const imageMap: Record<string, string> = {}
        transformedData.forEach((mentor) => {
          if (mentor.profile_image_url) {
            imageMap[mentor.id] = mentor.profile_image_url
          } else if (mentor.profile?.avatar) {
            imageMap[mentor.id] = mentor.profile.avatar
          } else {
            imageMap[mentor.id] = "/placeholder.svg?height=200&width=200"
          }
        })

        setMentorImages(imageMap)
      } catch (err: any) {
        console.error("Error fetching mentors:", err)
        setError(err.message || "Failed to load mentors")
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Consultants</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">No consultants found</p>
        ) : (
          mentors.map((mentor) => (
            <Card key={mentor.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="h-3 bg-primary"></div>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-muted">
                  <AvatarImage
                    src={mentorImages[mentor.id] || "/placeholder.svg"}
                    alt={mentor.profile?.name || "Mentor"}
                    onError={(e) => {
                      console.error("Failed to load image:", mentorImages[mentor.id])
                      e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                    }}
                  />
                  <AvatarFallback>{(mentor.profile?.name || "?").charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{mentor.profile?.name || "Unnamed Mentor"}</CardTitle>
                  <CardDescription>{mentor.title || "Consultant"}</CardDescription>
                  <p className="text-sm font-medium">{mentor.university || "University not specified"}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={mentor.rating} />
                  <span className="text-sm text-muted-foreground">({mentor.review_count} reviews)</span>
                </div>

                {mentor.awards && mentor.awards.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-medium px-3 py-2 rounded-md bg-gray-700 text-white">
                      {mentor.awards[0].title}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">Services from</span>
                    <span className="font-bold text-lg ml-1">
                      ${mentor.services.length > 0 ? Math.min(...mentor.services.map((s) => s.price)) : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 pb-4">
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/mentors/${mentor.id}`}>View Profile</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
