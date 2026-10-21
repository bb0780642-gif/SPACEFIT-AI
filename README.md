# SpaceFit AI — Intelligent 3D Room Design & Spatial Optimization

![SpaceFit AI](https://img.shields.io/badge/SpaceFit-AI-3b82f6?style=for-the-badge&logo=three.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

SpaceFit AI is an intelligent 3D room-design and spatial-optimization platform that transforms room dimensions, wall geometry, and furniture requirements into real-time interactive 3D digital twins, continuous physics simulations, and verifiable architectural design specifications.

---

## 🌟 Key Features Across Phases 1–9

### 1. Parametric 2D Blueprint & Wall Geometry
- Accurate metric & imperial geometry editor ($m \leftrightarrow ft$).
- Real-time door and window placement with offset clamping, sill heights, and inward/outward swings.
- Instant boundary and opening overlap validation.

### 2. Interactive 3D Digital Twin (Three.js / React Three Fiber)
- Procedural room builder with extruded wall cutouts, floors, and window glass shaders.
- Orbit camera rig with presets (*Perspective, Top-Down, Front, Isometric*).
- Studio lighting with ambient, directional sunlight, and shadows.

### 3. Smart Furniture Catalog & SAT Collision Engine
- Searchable library of procedural 3D furniture (*Beds, Desks, Sofas, Wardrobes, Shelves, Chairs*).
- Exact 2D/3D Separating Axis Theorem (SAT) collision detection flagging overlaps and blocked doors.
- Wall snapping, 90° rotation controls, and undo/redo history.

### 4. Deterministic Layout Optimization Engine
- Constraint-based layout optimizer generating multiple feasible arrangements across 5 modes:
  - **Balanced Layout**: Harmonious circulation and functional grouping.
  - **Movement First**: Maximizes walking fairways and doorway clearance.
  - **Space Saver**: Perimeter docking to maximize central open floor space.
  - **Comfort Focus**: Relaxed conversational grouping.
  - **Study & Productivity**: Positions study desks adjacent to natural window daylight.

### 5. Multilingual NLP AI Design Assistant
- Natural language voice and text design assistant supporting:
  - **English**, **Tamil (தமிழ்)**, **Hindi (हिन्दी)**, and colloquial **Thanglish**.
- Allowlisted tool-calling (*add furniture, move, rotate, optimize, analyze paths, compare*).
- Built-in offline rule engine fallback when no cloud API key is configured.

### 6. First-Person Walkthrough & Movement Simulation
- Mouse-look yaw/pitch controls clamped to $\pm 80^\circ$.
- WASD keyboard navigation at $1.6\text{m}$ eye level with walking and sprint speeds.
- Continuous collision resolution with smooth avatar sliding physics against walls and furniture OBBs ($r = 0.28\text{m}$).
- 8-connected A* corridor pathfinding at $0.1\text{m}$ grid resolution with bottleneck clearance detection.

### 7. Before-and-After Comparison & Analytics Dashboard
- Side-by-side Top-Down 2D floor plans comparing active layouts against optimizer candidates or saved versions.
- Genuine quantitative deltas: Open Floor Area ($\Delta m^2$), Boundary Violations, Walking Distance ($\Delta m$), and SpaceFit Score.
- Multi-criteria score breakdown: Safety, Circulation Flow, Floor Space Ratio, and Daylight Access.

### 8. Project & Version Management
- Save named layout version snapshots with isolation.
- Restore historical versions directly back into the 2D/3D workspace canvas.
- Rename, delete, and persist versions in `localStorage`.

### 9. Exportable Architectural Design Reports
- **Print / PDF Specification**: Dedicated print styling (`@media print`) rendering a clean specification sheet without UI clutter.
- **JSON Blueprint**: Downloadable `.spacefit.json` containing complete configuration and furniture coordinates.
- **CSV Furniture Schedule**: Downloadable `.csv` schedule with item dimensions and spatial coordinates for procurement.

---

## 🛠️ The 6-Stage Primary User Workflow

```
[1. Room Setup] ➔ [2. Furnish] ➔ [3. Optimize] ➔ [4. Walkthrough] ➔ [5. Compare] ➔ [6. Export Report]
```

1. **Room Setup**: Input room dimensions ($W \times L \times H$) and place doors/windows along perimeter walls.
2. **Furnish**: Add furniture from the catalog, rotate, and position in 3D.
3. **Optimize**: Run the AI Optimizer to generate multiple feasible candidate layouts.
4. **Walkthrough**: Explore the room in first-person mode with WASD locomotion and collision sliding.
5. **Compare**: Compare the baseline and optimized layouts side-by-side with quantitative deltas.
6. **Export Report**: Generate a printable architectural PDF spec sheet, JSON blueprint, or CSV schedule.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm`

### Installation
```bash
# Clone the repository
git clone https://github.com/bb0780642-gif/SPACEFIT-AI.git

# Navigate to project directory
cd SPACEFIT-AI

# Install dependencies
npm install
```

### Running Locally
```bash
# Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Unit Tests
```bash
# Run Vitest test suite (63 unit tests across 10 test files)
npm test
```

### Production Build
```bash
# Type-check and compile production bundle
npm run build
```

---

## ⚙️ Environment Variables (Optional)

Create a `.env` file in the root directory:
```env
# Optional: Google Gemini API Key for cloud-based multilingual LLM inference
# If omitted or offline, SpaceFit AI uses its deterministic offline NLP engine
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🧪 Verified Test Suite

```
✓ src/components/scene3d/roomGeometryBuilder.test.ts (4 tests)
✓ src/utils/geometry.test.ts (10 tests)
✓ src/utils/collision.test.ts (7 tests)
✓ src/utils/nlp/languageDetector.test.ts (6 tests)
✓ src/utils/nlp/intentParser.test.ts (8 tests)
✓ src/utils/layoutOptimizer.test.ts (6 tests)
✓ src/utils/analytics/layoutMetrics.test.ts (4 tests)
✓ src/utils/movement/pathfinding.test.ts (7 tests)
✓ src/utils/nlp/toolRegistry.test.ts (7 tests)
✓ src/utils/storage.test.ts (4 tests)

Total: 10 test files, 63 tests passed (100% success)
```

---

## ⚖️ Engineering Limitations & Scope

- **Geometric Feasibility vs. Safety Certification**: SpaceFit AI evaluates 2D/3D Euclidean geometric clearances, continuous bounding box intersections, and 10cm grid A* navigation paths based on user-configured thresholds. It does not simulate human biomechanics, wheelchair kinematics, or accredited building/ADA life-safety code compliance.
- **Offline NLP Engine**: In the absence of an external API key, the built-in parser extracts spatial verbs, furniture nouns, and coordinates deterministically.

---

## 📄 License

This project is licensed under the MIT License.
