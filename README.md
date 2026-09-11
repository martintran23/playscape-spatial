# Playscape Spatial

> A mobile computer vision and browser-based 3D staging tool that reconstructs real-world site topography, vegetation, and obstacles from smartphone captures for rapid commercial playground layout planning and clearance validation.

A rework of the original **Playscape Studio**, transitioning from static 2D satellite maps to an on-site 3D spatial sandbox tailored for commercial playground sales representatives, park planners, and site evaluators.

---

## The Problem & The Solution

* **The Problem:** Commercial playground sales cycles (e.g., Zoom Recreation) frequently stall during preliminary site visits. Sales reps rely on tape measures, 2D satellite maps, and disconnected photos. Topography, subtle ground slopes (critical for drainage and ADA compliance), tree canopies, and real-world boundaries get missed—causing costly redesigns and change orders when equipment arrives on-site.
* **The Solution:** A two-stage pipeline. First, an on-site smartphone capture generates a metric-scale 3D digital twin of the plot. Second, a lightweight, browser-based 3D sandbox lets the rep drag, drop, and rotate catalog playground structures, snap them to terrain elevation, and verify clearance buffers directly with clients.

```mermaid
flowchart LR
    A[On-Site Mobile Capture] --> B[Metric Scale & Pose Estimation]
    B --> C[3D Terrain & Obstacle Extraction]
    C --> D[Web-Based 3D Sandbox]
    E[Normalized GLB Catalog] --> D
    D --> F[ASTM Clearance & Layout Validation]
    D --> G[Project JSON Export]