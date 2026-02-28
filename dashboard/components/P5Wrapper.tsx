'use client'

import p5 from 'p5'
import { useEffect, useRef } from 'react'

interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: number[]
  label: string
  type: string
  age?: number
}

interface P5WrapperProps {
  particles: Particle[]
}

export default function P5Wrapper({ particles }: P5WrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sketchRef = useRef<p5 | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const sketch = (p: p5) => {
      let localParticles: Particle[] = [...particles]
      let animationTime = 0

      p.setup = () => {
        const width = containerRef.current?.clientWidth || 800
        const height = containerRef.current?.clientHeight || 600
        const canvas = p.createCanvas(width, height)
        canvas.parent(containerRef.current!)
        p.background(17, 24, 39) // gray-900
      }

      p.draw = () => {
        p.background(17, 24, 39, 20) // Slight fade for trails
        animationTime += 0.01

        // Update and draw particles
        localParticles.forEach((particle, index) => {
          // Physics simulation
          particle.x += particle.vx
          particle.y += particle.vy
          particle.age = (particle.age || 0) + 1

          // Boundary wrapping
          if (particle.x < 0) particle.x = p.width
          if (particle.x > p.width) particle.x = 0
          if (particle.y < 0) particle.y = p.height
          if (particle.y > p.height) particle.y = 0

          // Slight attraction to center
          const centerX = p.width / 2
          const centerY = p.height / 2
          const dx = centerX - particle.x
          const dy = centerY - particle.y
          const distance = p.sqrt(dx * dx + dy * dy)
          const maxDistance = 400

          if (distance < maxDistance) {
            const attraction = 0.0001 * (1 - distance / maxDistance)
            particle.vx += (dx / distance) * attraction
            particle.vy += (dy / distance) * attraction
          }

          // Draw glow effect
          p.noStroke()
          const color = particle.color
          p.fill(color[0], color[1], color[2], 30)
          p.circle(particle.x, particle.y, particle.size * 3)

          p.fill(color[0], color[1], color[2], 60)
          p.circle(particle.x, particle.y, particle.size * 1.5)

          // Draw main particle
          p.fill(color[0], color[1], color[2], 255)
          p.circle(particle.x, particle.y, particle.size)

          // Draw connections between particles
          const connectionDistance = 200
          localParticles.forEach((other, otherIndex) => {
            if (otherIndex <= index) return
            const dx = other.x - particle.x
            const dy = other.y - particle.y
            const dist = p.sqrt(dx * dx + dy * dy)

            if (dist < connectionDistance) {
              const opacity = 50 * (1 - dist / connectionDistance)
              p.stroke(color[0], color[1], color[2], opacity)
              p.strokeWeight(0.5)
              p.line(particle.x, particle.y, other.x, other.y)
            }
          })
        })

        // Draw info on hover (optional)
        drawInfoPanel(p, localParticles)
      }

      const drawInfoPanel = (p: p5, particles: Particle[]) => {
        // Check if mouse is over a particle
        let hoveredParticle: Particle | null = null

        particles.forEach((particle: Particle) => {
          const d = p.dist(p.mouseX, p.mouseY, particle.x, particle.y)
          if (d < particle.size + 10) {
            hoveredParticle = particle
          }
        })

        if (hoveredParticle !== null && hoveredParticle !== undefined) {
          p.fill(0, 0, 0, 200)
          p.strokeWeight(1)
          p.stroke(100, 200, 100)
          p.rect(p.mouseX + 10, p.mouseY + 10, 180, 80, 5)

          p.fill(255)
          p.textSize(11)
          p.textAlign(p.LEFT)
          const hovered = hoveredParticle as Particle
          p.text(`ID: ${hovered.id}`, p.mouseX + 15, p.mouseY + 28)
          p.text(`Type: ${hovered.type}`, p.mouseX + 15, p.mouseY + 44)
          p.text(`Weight: ${hovered.label}`, p.mouseX + 15, p.mouseY + 60)
        }
      }

      p.windowResized = () => {
        if (!containerRef.current) return
        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight
        p.resizeCanvas(width, height)
      }

      p.mouseMoved = () => {
        // Repel particles from mouse
        localParticles.forEach((particle) => {
          const dx = particle.x - p.mouseX
          const dy = particle.y - p.mouseY
          const distance = p.sqrt(dx * dx + dy * dy)
          const minDistance = 100

          if (distance < minDistance) {
            const repulsion = 0.5 * (1 - distance / minDistance)
            particle.vx += (dx / distance) * repulsion
            particle.vy += (dy / distance) * repulsion
          }
        })
      }
    }

    sketchRef.current = new p5(sketch)

    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove()
        sketchRef.current = null
      }
    }
  }, [particles])

  return <div ref={containerRef} className="w-full h-full" />
}
