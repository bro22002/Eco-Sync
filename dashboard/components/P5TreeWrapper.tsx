"use client";

import p5 from "p5";
import { useEffect, useRef } from "react";

interface TreeData {
  transportType: "air" | "sea" | "land";
  carbonScore: number;
  position: { x: number; y: number };
  totalEmissions: number;
}

interface P5TreeWrapperProps {
  trees: TreeData[];
  overallCarbonScore: number;
  isPreview?: boolean;
}

class Tree {
  branchLength: number;
  angle: number;
  depth: number;
  maxDepth: number;
  carbonScore: number;
  transportType: "air" | "sea" | "land";

  constructor(
    carbonScore: number,
    transportType: "air" | "sea" | "land",
    maxDepth: number = 10,
  ) {
    this.carbonScore = carbonScore; // 0-100 scale
    this.transportType = transportType;
    this.maxDepth = maxDepth;
    this.angle = Math.PI / 5;
    this.depth = 0;
    // Higher carbon score = shorter branches
    this.branchLength = 20 + (100 - carbonScore) * 0.8;
  }

  /**
   * Get leaf color based on carbon score
   * Low score (0-33) = green (healthy)
   * Medium score (34-66) = yellow
   * High score (67-100) = brown (unhealthy)
   */
  getLeafColor(p: p5): { r: number; g: number; b: number } {
    if (this.carbonScore < 33) {
      // Green: vibrant and healthy
      return { r: 34, g: 197, b: 94 };
    } else if (this.carbonScore < 67) {
      // Yellow: transitioning
      return { r: 245, g: 158, b: 11 };
    } else {
      // Brown: stressed and unhealthy
      return { r: 139, g: 69, b: 19 };
    }
  }

  /**
   * Get branch color - browner for higher carbon scores
   */
  getBranchColor(): { r: number; g: number; b: number } {
    // Base brown color, gets lighter with lower scores
    const brownAmount = (this.carbonScore / 100) * 100;
    const greenAmount = 50 + (100 - this.carbonScore) * 0.3;

    return {
      r: 101 + brownAmount * 0.3,
      g: 67 + greenAmount * 0.1,
      b: 33,
    };
  }

  /**
   * Draw the tree using recursive branching
   */
  draw(
    p: p5,
    x: number,
    y: number,
    angle: number,
    depth: number = 0,
    branchLength?: number,
  ): void {
    // Use provided branchLength or initialize from instance
    if (branchLength === undefined) {
      branchLength = this.branchLength;
    }

    if (depth > this.maxDepth) return;
    if (branchLength < 2) return;

    // Calculate end point
    const x2 = x + Math.cos(angle) * branchLength;
    const y2 = y + Math.sin(angle) * branchLength;

    // Draw branch with thickness based on depth
    const strokeWidth = Math.max(1, this.maxDepth - depth);
    const branchColor = this.getBranchColor();
    p.stroke(branchColor.r, branchColor.g, branchColor.b);
    p.strokeWeight(strokeWidth);
    p.line(x, y, x2, y2);

    // Draw leaves at branch ends
    if (depth > this.maxDepth - 3) {
      this.drawLeaves(p, x2, y2);
    }

    // Recursively draw branches with reduced length
    const reducedLength = branchLength * 0.67; // Branch reduction factor
    this.draw(p, x2, y2, angle - this.angle, depth + 1, reducedLength);
    this.draw(p, x2, y2, angle + this.angle, depth + 1, reducedLength);
  }

  /**
   * Draw leaves with color based on carbon score
   */
  drawLeaves(p: p5, x: number, y: number): void {
    const leafColor = this.getLeafColor(p);

    p.fill(leafColor.r, leafColor.g, leafColor.b);
    p.noStroke();

    // Draw clustered leaves
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 8;
      const offsetY = (Math.random() - 0.5) * 8;
      p.ellipse(x + offsetX, y + offsetY, 5, 3);
    }
  }

  /**
   * Reset branch length for redrawing
   */
  reset(): void {
    this.branchLength = 20 + (100 - this.carbonScore) * 0.8;
  }
}

export default function P5TreeWrapper({
  trees,
  overallCarbonScore,
  isPreview = false,
}: P5TreeWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current || trees.length === 0) return;

    const sketch = (p: p5) => {
      let treeInstances: Tree[] = [];
      let time = 0;

      p.setup = () => {
        const width = containerRef.current?.clientWidth || 800;
        const height = containerRef.current?.clientHeight || 600;
        const canvas = p.createCanvas(width, height);
        canvas.parent(containerRef.current!);
        p.background(17, 24, 39); // gray-900
      };

      p.draw = () => {
        time += 0.01;
        p.background(17, 24, 39, 30); // Semi-transparent for trail effect

        // Create trees if needed
        if (treeInstances.length !== trees.length) {
          treeInstances = trees.map(
            (treeData) =>
              new Tree(treeData.carbonScore, treeData.transportType),
          );
        }

        // Update tree instances with latest data
        trees.forEach((treeData, index) => {
          if (treeInstances[index]) {
            treeInstances[index].carbonScore = treeData.carbonScore;
            treeInstances[index].reset();
          }
        });

        // Draw each tree
        trees.forEach((treeData, index) => {
          const tree = treeInstances[index];

          // Position based on canvas dimensions
          const x = p.width * treeData.position.x;
          const y = p.height * 0.85;

          // Add gentle swaying animation
          const sway = Math.sin(time + index) * 0.05;
          const startAngle = -Math.PI / 2 + sway;

          // Draw tree
          p.push();
          tree.draw(p, x, y, startAngle);
          p.pop();
        });

        // Draw connection lines showing flow
        if (trees.length >= 3) {
          p.stroke(255, 200, 100, 20);
          p.strokeWeight(1);
          p.noFill();

          // Connect trees with curves
          const y1 = p.height * 0.85;
          const x1 = p.width * trees[0].position.x;
          const x2 = p.width * trees[2].position.x;

          p.bezier(
            x1,
            y1,
            (x1 + x2) / 2,
            y1 + 100,
            (x1 + x2) / 2,
            y1 + 100,
            x2,
            y1,
          );
        }

        // Draw carbon score indicator
        drawCarbonIndicator(p, overallCarbonScore, isPreview);
      };

      function drawCarbonIndicator(p: p5, score: number, preview: boolean = false) {
        // Draw a dynamic indicator in the center top
        const centerX = p.width / 2;
        const topY = 60;

        // Determine indicator color
        let r, g, b;
        if (score < 33) {
          r = 34;
          g = 197;
          b = 94;
        } else if (score < 67) {
          r = 245;
          g = 158;
          b = 11;
        } else {
          r = 239;
          g = 68;
          b = 68;
        }

        // Draw circular progress indicator
        p.fill(0, 0, 0, 100);
        p.stroke(r, g, b, 100);
        p.strokeWeight(2);
        p.circle(centerX, topY, 60);

        // Draw inner circle
        p.fill(r, g, b, 20);
        p.noStroke();
        p.circle(centerX, topY, 50);

        // Draw score text
        p.fill(r, g, b);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(20);
        p.textStyle(p.BOLD);
        p.text(score.toFixed(0), centerX, topY);

        // Draw label
        p.fill(200, 200, 200);
        p.textSize(10);
        p.text(preview ? "Preview Score" : "Carbon Score", centerX, topY + 35);

        // Draw preview badge if in preview mode
        if (preview) {
          p.fill(255, 193, 7, 200);
          p.stroke(255, 193, 7, 255);
          p.strokeWeight(1);
          p.rect(centerX - 35, topY + 50, 70, 20, 5);

          p.fill(0, 0, 0);
          p.textSize(11);
          p.textStyle(p.BOLD);
          p.text("SCENARIO", centerX, topY + 62);
        }
      }

      p.windowResized = () => {
        if (!containerRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        p.resizeCanvas(width, height);
      };
    };

    sketchRef.current = new p5(sketch);

    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
        sketchRef.current = null;
      }
    };
  }, [trees, overallCarbonScore, isPreview]);

  return <div ref={containerRef} className="w-full h-full" />;
}
