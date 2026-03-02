"use client";

import { useEffect, useRef } from "react";
import p5 from "p5";

interface TreeData {
  transportType: "air" | "sea" | "land";
  carbonScore: number;
  position: { x: number; y: number };
  totalEmissions: number;
}

interface P5TreeWrapperProps {
  trees: TreeData[];
  overallScore: number;
  isPreview: boolean;
  selectedTransportType: "air" | "sea" | "land" | null;
}

export default function P5TreeWrapper({
  trees,
  overallScore,
  isPreview,
  selectedTransportType,
}: P5TreeWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<p5 | null>(null);
  const timeRef = useRef(0);

  const propsRef = useRef({ trees, overallScore, isPreview, selectedTransportType });

  useEffect(() => {
    propsRef.current = { trees, overallScore, isPreview, selectedTransportType };
  }, [trees, overallScore, isPreview, selectedTransportType]);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let container: HTMLElement | null = containerRef.current;

      class Tree {
        carbonScore: number;
        transportType: "air" | "sea" | "land";
        position: { x: number; y: number };
        maxDepth: number;
        isSelected: boolean;
        growthFactor: number;

        constructor(
          carbonScore: number,
          transportType: "air" | "sea" | "land",
          position: { x: number; y: number },
          isSelected: boolean,
        ) {
          this.carbonScore = carbonScore;
          this.transportType = transportType;
          this.position = position;
          this.maxDepth = 9;
          this.isSelected = isSelected;
          this.growthFactor = p.map(carbonScore, 0, 100, 0.4, 1.2);
        }

        draw(time: number) {
          p.push();
          const canvasW = p.width;
          const canvasH = p.height;
          const posX = this.position.x * canvasW;
          const posY = this.position.y * canvasH;

          p.translate(posX, posY);

          // Selection Glow & Scale
          if (this.isSelected) {
            const glowSize = 120 + Math.sin(time * 3) * 20;
            p.noStroke();
            for (let i = 4; i > 0; i--) {
              p.fill(34, 197, 94, 15 / i);
              p.circle(0, -40, glowSize + i * 20);
            }
            p.scale(1.1);
          }

          // Tree sway animation
          const sway = Math.sin(time * 0.8 + this.position.x * 20) * (this.isSelected ? 0.04 : 0.02);
          p.rotate(sway);

          // Root anchor
          p.noStroke();
          p.fill(15, 23, 42, 100);
          p.ellipse(0, 0, 40, 10);

          this.drawBranch(65 * this.growthFactor, 12, time, 0);

          // Label
          p.push();
          p.translate(0, 25);
          p.rotate(-sway);
          p.textAlign(p.CENTER, p.TOP);
          p.textSize(10);
          p.textStyle(p.BOLD);
          p.fill(this.isSelected ? 255 : 150);
          p.text(this.transportType.toUpperCase(), 0, 0);
          p.pop();

          p.pop();
        }

        drawBranch(
          len: number,
          thickness: number,
          time: number,
          depth: number,
        ) {
          if (depth > this.maxDepth || len < 4) return;

          // Branch color
          const depthRatio = depth / this.maxDepth;
          const scoreRatio = this.carbonScore / 100;
          
          // Interpolate branch color based on health and depth
          const healthColor = this.getLeafColor();
          const branchBaseColor = [60, 40, 30]; // Dark brown
          const r = p.lerp(branchBaseColor[0], healthColor[0] * 0.5, depthRatio);
          const g = p.lerp(branchBaseColor[1], healthColor[1] * 0.5, depthRatio);
          const b = p.lerp(branchBaseColor[2], healthColor[2] * 0.5, depthRatio);
          
          p.stroke(r, g, b, 255 - (depth * 10));
          p.strokeWeight(Math.max(1, thickness * (1 - depthRatio)));
          
          // Draw branch with subtle curve
          const curve = Math.sin(time + depth) * 2;
          p.line(0, 0, curve, -len);
          p.translate(curve, -len);

          // Leaves
          if (depth > 4) {
            this.drawLeaves(depth, time);
          }

          // Split branches
          if (depth < this.maxDepth) {
            const splits = 2;
            for (let i = 0; i < splits; i++) {
              p.push();
              const angle = p.map(i, 0, splits - 1, -0.6, 0.6) + Math.sin(time * 0.5 + depth) * 0.05;
              p.rotate(angle);
              this.drawBranch(len * 0.75, thickness * 0.7, time, depth + 1);
              p.pop();
            }
          }
        }

        drawLeaves(depth: number, time: number) {
          const leafColor = this.getLeafColor();
          const opacity = p.map(depth, 5, this.maxDepth, 50, 200);
          p.fill(leafColor[0], leafColor[1], leafColor[2], opacity);
          p.noStroke();

          const leafSize = p.map(depth, 5, this.maxDepth, 4, 10) * (this.isSelected ? 1.2 : 1);
          
          // Draw a few overlapping ellipses for a "bushy" look
          for (let i = 0; i < 3; i++) {
            const ox = Math.cos(i * 2 + time) * 3;
            const oy = Math.sin(i * 2 + time) * 3;
            p.ellipse(ox, oy, leafSize, leafSize * 1.5);
          }
        }

        getLeafColor(): [number, number, number] {
          const score = this.carbonScore;
          if (score > 66) {
            return [34, 197, 94]; // Eco Green
          } else if (score > 33) {
            return [245, 158, 11]; // Warning Amber
          } else {
            return [239, 68, 68]; // Critical Red
          }
        }
      }

      p.setup = function () {
        if (container) {
          const width = container.clientWidth;
          const height = container.clientHeight;
          const canvas = p.createCanvas(width, height);
          canvas.parent(container);
          p.pixelDensity(1);
        }
      };

      p.draw = function () {
        const currentProps = propsRef.current;
        p.clear(); // Transparent background
        
        // Deep background glow
        p.push();
        p.translate(p.width / 2, p.height / 2);
        p.noStroke();
        for (let i = 5; i > 0; i--) {
          p.fill(15, 23, 42, 20 / i);
          p.ellipse(0, 0, p.width * (i * 0.2), p.height * (i * 0.2));
        }
        p.pop();

        timeRef.current += 0.01;

        // Draw flow lines between regions
        if (currentProps.trees.length >= 2) {
          p.noFill();
          currentProps.trees.forEach((from, i) => {
            if (i === currentProps.trees.length - 1) return;
            const to = currentProps.trees[i + 1];
            
            p.stroke(255, 255, 255, 10);
            p.strokeWeight(1);
            const x1 = from.position.x * p.width;
            const y1 = from.position.y * p.height;
            const x2 = to.position.x * p.width;
            const y2 = to.position.y * p.height;
            
            p.bezier(x1, y1, x1, y1 - 200, x2, y2 - 200, x2, y2);
            
            // Traveling particles
            const particlePos = (timeRef.current * 0.5 + i * 0.3) % 1;
            const px = p.bezierPoint(x1, x1, x2, x2, particlePos);
            const py = p.bezierPoint(y1, y1 - 200, y2 - 200, y2, particlePos);
            
            p.fill(34, 197, 94, 150);
            p.noStroke();
            p.circle(px, py, 3);
          });
        }

        // Draw trees
        currentProps.trees.forEach((treeData) => {
          const tree = new Tree(
            treeData.carbonScore,
            treeData.transportType,
            treeData.position,
            currentProps.selectedTransportType === treeData.transportType,
          );
          tree.draw(timeRef.current);
        });

        // Overall Score Widget - Top Center
        p.push();
        const scoreX = p.width / 2;
        const scoreY = 60;
        
        // Background blur-like circle
        p.noStroke();
        p.fill(0, 0, 0, 150);
        p.circle(scoreX, scoreY, 80);
        
        // Ring
        p.noFill();
        p.stroke(255, 255, 255, 20);
        p.strokeWeight(4);
        p.circle(scoreX, scoreY, 70);
        
        // Progress Ring
        const scoreAngle = p.map(currentProps.overallScore, 0, 100, 0, p.TWO_PI);
        p.stroke(34, 197, 94);
        p.strokeWeight(4);
        p.arc(scoreX, scoreY, 70, 70, -p.HALF_PI, scoreAngle - p.HALF_PI);

        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.textStyle(p.BOLD);
        p.text(Math.round(currentProps.overallScore), scoreX, scoreY - 5);
        p.textSize(8);
        p.textStyle(p.BOLD);
        p.fill(150);
        p.text("FLEET SCORE", scoreX, scoreY + 15);
        p.pop();

        // Scenario Preview Banner
        if (currentProps.isPreview) {
          p.push();
          p.fill(245, 158, 11, 200);
          p.noStroke();
          p.rect(p.width - 160, 0, 160, 40, 0, 0, 0, 20);
          p.fill(0);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(10);
          p.textStyle(p.BOLD);
          p.text("SCENARIO ACTIVE", p.width - 80, 20);
          p.pop();
        }
      };

      p.windowResized = function () {
        if (container) {
          p.resizeCanvas(container.clientWidth, container.clientHeight);
        }
      };
    };

    sketchRef.current = new p5(sketch);

    return () => {
      sketchRef.current?.remove();
      sketchRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full relative" />;
}
