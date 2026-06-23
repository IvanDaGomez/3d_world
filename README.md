Act as an elite Senior Full-Stack Engineer and UX Architect specializing in React, TypeScript, Tailwind CSS, Three.js, and high-end direct-to-consumer (DTC) hardware brand design. 

I need you to build a complete, production-ready frontend prototype for my premium hardware startup, "Camilo's Tech Studio". The application must be written entirely in strict, idiomatic TypeScript and use Tailwind CSS for structural layout. 

Build this app with four main architectural views that I can seamlessly toggle between via a global navigation system or a hidden Developer Admin navbar:
1. Premium Brand Landing Page (DTC E-commerce Homepage)
2. Interactive Storefront & Dynamic 3D Configurator Canvas
3. Transactional Checkout Flow (Simulating a secure local Wompi / PSE gateway)
4. Internal Production & Product Management Dashboard (The Admin Portal)

---

### STRICT TYPESCRIPT DATA MODELS:
You must define and use explicit TypeScript interfaces for all major application states. Ensure strict typing for:
- `interface Product` (id, name, basePrice, category, thumbnail, description, options)
- `interface Configuration` (productId, filamentColor, hardwareUpgrades[], customText, finalPrice)
- `interface Order` (id, customerData, configuration, totalAmount, status: 'QUEUED' | 'PRINTING' | 'ASSEMBLING' | 'SHIPPED', createdAt)
- `interface Analytics` (totalRevenue, activeJobs, filamentUsedKg, machinePaybackProgress)

---

### VIEW SPECIFICATIONS & ARCHITECTURE:

#### 1. PREMIUM BRAND LANDING PAGE
- Design a high-conversion, cinematic homepage layout for a premium tech brand.
- **Hero Section:** An aggressive, sleek title (e.g., "NEVER JUST PLASTIC // ENGINEERED DESK GEAR"). Include a high-impact subtitle emphasizing local engineering out of Bogotá, embedded electronics, and premium functional hardware design. 
- **Value Proposition Grid:** Use crisp Lucide icons to showcase 3 structural pillars: 
  1. *Embedded Intelligence* (ESP32-S3 firmware, WebUSB APIs, and addressable lighting).
  2. *Mechanical Precision* (Hidden neodymium magnets and strict engineering fit tolerances).
  3. *Vibecoded Customization* (Real-time interactive 3D web configurations).
- **Featured Collection Showcase:** Display beautiful grid cards for our anchor products: **The CyberLamp**, **The AuraDock (PS4/PS5 premium controller display dock)**, and **The MagHold (Geometric NFC/Magnet Keychains & Trays)**. Each card must feature an explicit "Customize in 3D" button that instantly shifts application view-state to the Configurator with that specific product active.

#### 2. INTERACTIVE 3D CONFIGURATOR STOREFRONT
- Match the layout principles shown in watermarked_img_9220663326050581424.png and watermarked_img_15409159078213215215.png.
- **Left Control Panel:** Interactive input forms driving the active configuration state.
  - Category / Product Quick-swaps.
  - Shell/Chassis Finishes: Toggle choices (e.g., Matte Black, Glossy Carbon Fiber PLA, Concrete Grey, Silk Copper).
  - Hardware Upgrades (Checkboxes/Toggles): "Base Static LED", "Reactive Aura (ESP32-S3 Sync)", "Hidden Neodymium Magnets", "Embedded NFC Automation Tag".
  - Custom Engraving Input: Text input field to live-preview text on the chassis.
- **Center Canvas Viewport:** A dark, immersive 3D simulation area using a Mock WebGL Canvas component or React Three Fiber hooks. It must dynamically re-render, change mesh color textures, adjust glowing ambient lighting colors, and map custom text in real-time based on the exact TypeScript configuration state object modified by the left panel. Add custom UI overlay buttons for orbit camera rotation controls.
- **Right Checkout Summary:** A summary box detailing selected configurations, base costs, component upgrade premiums, and a dynamic real-time total calculated in Colombian Pesos (COP). Include a high-visibility checkout trigger button: "PAY WITH WOMPI / PSE".

#### 3. SECURE LOCAL CHECKOUT FLOW
- Provide a modal overlay or view transition mimicking a high-end regional payment interface.
- Complete form validation in TypeScript for customer metadata: Full Name, Email, Delivery Address in Bogotá/Colombia, and Phone Number.
- Selectable checkout modules: PSE Bank Transfer, Nequi, or Daviplata.
- Provide a step-by-step loading animation state that acts out the server-side API webhook verification before transitioning into an interactive "ORDER COMPLETE // SYNCED TO PRODUCTION" success card.

#### 4. ADMIN DASHBOARD & MANUFACUTRING PORTAL
- The control hub that automates my operational business line while I attend classes.
- **Live Manufacturing Queue:** An interactive data table that displays approved orders pushed from the checkout state. Admin actions can advance an order's status through its lifecycle pipeline (`QUEUED` ➔ `PRINTING` ➔ `ASSEMBLING` ➔ `SHIPPED`).
- **Catalog Manager:** A form interface to dynamically update item pricing, toggle component availability parameters, adjust shipping estimates, or simulate uploading a raw STL mesh file structure to the catalog list.
- **Financial Analytics Suite:** Interactive widgets monitoring overall store velocity: Gross Sales (COP), Filament Consumed (Kg), Active Hardware Assembly Count, and an animated tracking meter evaluating progress toward covering a 2,500,000 COP structural printer asset cost.

---

### DESIGN LOOK-AND-FEEL (THE VIBE):
- Ultra-modern dark mode layout. Backgrounds should utilize deep zinc or charcoal layers (`bg-zinc-950`, `bg-zinc-900`) combined with elegant glassmorphism effects (`backdrop-blur-md bg-white/5 border border-white/10`).
- Accent glows driven by arbitrary Tailwind utility colors (e.g., electric violet, neon cyan, industrial copper, and flat olive matte).
- Typography must look clean, tracking-wide, and completely intentional.

---

### CODE QUALITY & OUTPUT RULES:
- Provide a fully operational, self-contained, and valid React TypeScript implementation.
- Do not use placeholders or truncated comments like `// implement later`. Write out the logical workflows for processing the data mutations using native React `useState` and `useEffect` arrays so that clicking checkout genuinely creates a fresh row in the admin view.
- Maximize component scannability and build it beautifully for immediate visualization. Begin generation.