# Campus Navigator 3D

Build a production-quality, hackathon-ready web application called Campus3D Navigator.

The application is an interactive 3D university/campus navigation platform that helps students, faculty, visitors, and staff navigate large university campuses using a WebGL-powered 3D map, live GPS positioning, intelligent routing, multi-floor navigation, accessibility routing, crowd information, campus search, class schedules, and an experimental AR navigation mode.

This project is being developed for a 36-hour college hackathon, so prioritize a highly polished working MVP with realistic simulated campus data over incomplete complex integrations.

1. PRODUCT VISION

Create an experience that feels like:

Google Maps + 3D Digital Twin + Indoor Navigation + Campus AI Assistant

The application should feel futuristic, lively, interactive, professional, and impressive during a hackathon demo.

The primary experience should be:

User opens Campus3D Navigator.

User grants GPS permission.

The 3D campus loads.

User sees their current location.

User searches for a destination such as "Lecture Hall B204".

The application highlights the destination.

A shortest route is calculated.

The route is displayed as an animated glowing 3D path.

The user sees distance, ETA, floor changes, elevators/stairs, landmarks, and crowd information.

The user can start turn-by-turn navigation.

The user can switch to accessible/wheelchair mode.

The user can switch floors.

The user can open AR Mode.

The user can save frequently visited locations.

The user can view today's class schedule and navigate directly to the next class.

2. TECHNOLOGY

Use a modern React/Next.js architecture.

Preferred stack:

Next.js

React

TypeScript

Three.js

React Three Fiber if useful

WebGL

Tailwind CSS

shadcn/ui

Firebase

Firebase Authentication

Firestore

Firebase Realtime Database where appropriate

Browser Geolocation API

Lucide React icons

For 3D assets, structure the project so that realistic Blender/GLTF campus models can be added later.

Do not make the application dependent on an unavailable external 3D asset.

Create a beautiful procedural/demo campus using Three.js primitives if a real 3D model is unavailable.

3. VISUAL DESIGN

Create a premium futuristic university technology aesthetic.

Design language:

Dark navy/black background

Glassmorphism

Transparent panels

Soft gradients

Glowing cyan/blue navigation paths

Purple/blue accent lighting

White typography

Green for safe/accessible

Yellow for moderate crowd

Red for danger/construction

Subtle shadows

Neon edge highlights

Smooth transitions

Floating UI elements

3D depth

The interface should look like a combination of:

Google Maps

Apple Maps

modern digital twin dashboards

futuristic sci-fi interfaces

premium SaaS dashboards

Avoid excessive visual clutter.

Use animations throughout the experience, but keep usability excellent.

4. RESPONSIVE DESIGN

The application must work beautifully on:

Desktop

Laptop

Tablet

Mobile

Desktop:

Use a large 3D map canvas with floating navigation panels.

Mobile:

Use the 3D map as the main screen with bottom sheets and floating buttons.

Do not simply shrink the desktop UI.

Create a dedicated mobile-friendly navigation experience.

5. MAIN LANDING PAGE

Create a visually impressive landing page.

Hero title:

Navigate Your Campus. In 3D.

Subtitle:

Campus3D Navigator transforms your university into an intelligent 3D digital map with real-time navigation, indoor routing, accessibility paths, and campus intelligence.

Buttons:

Explore Campus

Start Navigation

Add an interactive 3D campus preview in the hero.

Include floating feature cards:

Live GPS

3D Navigation

Multi-Floor Routing

Accessible Paths

Crowd Intelligence

AR Navigation

Use subtle parallax and 3D animations.

6. MAIN NAVIGATION DASHBOARD

After clicking Explore Campus, open the main navigation dashboard.

Desktop layout:

LEFT SIDEBAR:

Campus3D logo

Explore

Navigate

Places

Schedule

Favorites

AR Mode

Accessibility

Settings

CENTER:
Large interactive Three.js/WebGL 3D campus.

RIGHT:
Navigation/search panel.

Top bar:

Search campus

GPS status

Notification

Profile

7. 3D CAMPUS

Create a realistic-looking demo university campus using Three.js.

Include:

Main Gate

Administration Building

Computer Engineering Block

Science Block

Library

Auditorium

Canteen

Sports Ground

Parking

Hostel

Medical Center

Garden

Bus Stop

Multiple lecture halls

Multiple laboratories

Use realistic building proportions.

Add roads, pathways, trees, street lights, benches, parking areas and campus landmarks.

Buildings should have:

Hover effect

Glow outline

Building name

Building type

Click interaction

When a building is selected, show a floating information card.

Example:

COMPUTER ENGINEERING BLOCK

12 Rooms
4 Labs
3 Floors

[ Navigate ]

8. CAMERA CONTROLS

Implement:

Orbit

Zoom

Pan

Fly-through

Smooth camera transitions

Double click to focus

Building focus animation

Add buttons:

[ + ]
[ − ]
[ GPS ]
[ 3D ]
[ TOP ]
[ FLY ]

The user should be able to smoothly fly toward a selected building.

9. GPS LOCATION

Use the browser Geolocation API.

Request user permission.

Use:

navigator.geolocation.watchPosition()

Show a 3D user location marker.

The marker should have:

Pulsing outer ring

Glowing center

"You are here" label

Display:

GPS Accuracy
Current Coordinates
Location status

If GPS is unavailable, gracefully fall back to demo campus positioning.

Create a DEMO MODE toggle for hackathon demonstrations.

10. SEARCH

Create an intelligent campus search.

Search examples:

B204

Computer Lab

Library

Canteen

Auditorium

Administration Office

Washroom

Parking

Main Gate

Search results should include:

Icon
Name
Building
Floor
Distance
Category

Example:

B204
Lecture Hall
Computer Engineering Block • Floor 2

280m • 4 min

[ Navigate ]

Add fuzzy search.

11. ROUTING ENGINE

Implement a graph-based campus routing engine.

Represent campus paths as nodes and edges.

Each edge should contain:

distance

walking time

accessibility

stairs

elevator

construction status

crowd level

Implement route modes:

FASTEST
ACCESSIBLE
AVOID CONSTRUCTION
LOW CROWD

The routing engine should calculate a path from the user's current location to the selected destination.

Use Dijkstra or A* for the routing algorithm.

The selected route should be rendered as a glowing animated 3D tube/line over the campus.

Animate a moving navigation marker along the path.

12. ROUTE UI

When a destination is selected, display:

DESTINATION

Lecture Hall B204

DISTANCE
280 m

ETA
4 min

ROUTE
Main Gate → Block B → Elevator → Floor 2 → B204

Buttons:

[ START NAVIGATION ]

[ ACCESSIBLE ROUTE ]

[ ALTERNATIVE ROUTES ]

Show:

Fastest Route
4 min

Accessible Route
5 min

Low Crowd Route
6 min

13. TURN-BY-TURN NAVIGATION

When navigation starts, show a bottom navigation card.

Example:

↑ Continue straight for 80m

Then:

↰ Turn left

Then:

🛗 Take elevator to Floor 2

Then:

→ Walk 30m

Then:

📍 You have arrived at B204

Animate instructions.

Update the navigation state as the simulated GPS position moves.

14. MULTI-FLOOR NAVIGATION

Support at least:

Ground Floor
Floor 1
Floor 2
Floor 3

Create a floating floor selector.

Example:

G
1
2
3

When the user selects a floor:

Hide or fade irrelevant floors

Highlight selected floor

Show rooms

Show elevators

Show stairs

Show route

For a route between floors, visually animate the path through an elevator or stairwell.

15. ACCESSIBILITY MODE

Create a prominent:

♿ Accessible Route

toggle.

When active:

Avoid stairs

Prefer elevators

Avoid inaccessible entrances

Prefer wider pathways

Display wheelchair-friendly routes

Change route visualization to indicate accessible routing.

Display:

Accessible Route
5 min
Elevator required

16. CONSTRUCTION ZONES

Create construction zones on the demo map.

Show them as:

🚧 Construction

Use a striped/glowing warning area.

Routing should automatically avoid active construction nodes.

Admin/demo data should allow:

construction name

location

status

start date

end date

17. CROWD DENSITY

Add simulated real-time crowd density.

Categories:

LOW
MODERATE
HIGH

Visualize crowd density using map overlays.

Example:

Library — LOW
Canteen — HIGH
Main Gate — MODERATE
Block B — LOW

Show crowd information when the user clicks a building.

Add a map toggle:

[ Crowd ]

When enabled, paths/buildings should display crowd intensity.

Use Firebase-ready data structures so simulated data can later be replaced by real sensors.

18. CAMPUS PLACES

Create a Places page.

Categories:

Academic
Food
Emergency
Transport
Sports
Administration
Accessibility

Cards should include:

Name

Building

Floor

Opening hours

Crowd level

Accessibility

Navigate button

Example:

LIBRARY

Academic

Block A • Floor 1

Open until 8:00 PM

🟢 Low crowd

♿ Accessible

[ Navigate ]

19. CLASS SCHEDULE

Create a Schedule page.

Example:

TODAY

09:00 AM
Data Structures
Lecture Hall B204

11:00 AM
Database Management
Lab C103

02:00 PM
Computer Networks
Room A301

Each class should have:

[ Navigate ]

Add:

NEXT CLASS

Data Structures
B204

Starts in 18 min

[ Navigate Now ]

20. FAVORITES

Create a Favorites page.

Allow users to save:

B204

Computer Lab

Library

Canteen

Main Gate

Display:

⭐ Frequent Destinations

Clicking a favorite immediately opens the navigation route.

21. AI CAMPUS ASSISTANT

Add a floating AI assistant button.

Button:

✨ Campus AI

Create a conversational assistant UI.

Example prompts:

"Where is the nearest computer lab?"

"How do I get to B204?"

"Find me an accessible route to the library."

"Where is the nearest washroom?"

"I have a lecture in B204. How do I get there?"

The assistant should convert destination requests into campus search/navigation actions.

For the MVP, use a deterministic intent/search system if a real AI API is unavailable.

Do not expose fake AI API keys.

22. AR MODE

Create an AR Mode page.

The MVP should provide a camera-style interface.

Request camera permission where supported.

Overlay:

Direction arrows

Destination label

Distance

Turn instruction

Landmark labels

Example:

↑

B204

120m

Turn left in 30m

If camera permissions are unavailable, provide a polished AR simulation using the 3D map.

Label it:

AR NAVIGATION — BETA

23. INDOOR POSITIONING FALLBACK

Create architecture for indoor positioning.

Support future WiFi/BLE beacon positioning.

For the hackathon MVP:

Create a simulated indoor positioning mode.

Show:

INDOOR POSITIONING

● WiFi Signal
● BLE Beacon
● Accuracy: 2.5m

If GPS becomes unavailable inside a building, automatically switch to:

Indoor Demo Positioning

24. USER PROFILE

Create a profile page.

Display:

Name
Email
Favorite locations
Accessibility preference
Navigation preference
Recent destinations

Settings:

Default route:
Fastest / Accessible / Low Crowd

Units:
Meters / Feet

Theme:
Dark / Light

25. ADMIN DASHBOARD

Create an admin dashboard.

Admin can view:

Total users
Active navigations
Popular destinations
Crowd density
Construction zones
Campus incidents

Cards:

ACTIVE USERS
1,248

ACTIVE NAVIGATIONS
327

CROWD ALERTS
12

CONSTRUCTION ZONES
4

Create a campus heatmap.

Admin controls:

Add Place
Edit Place
Add Construction
Remove Construction
Update Crowd Level
Manage Buildings
Manage Rooms
Manage Events

Use Firebase/Firestore architecture for persistence.

26. FIREBASE DATA MODEL

Design Firebase collections approximately as:

users
buildings
floors
rooms
places
paths
routes
constructionZones
crowdData
events
favorites
navigationSessions

Example building:

{
name: "Computer Engineering Block",
code: "CE",
floors: 3,
latitude: 19.000,
longitude: 73.000,
accessibility: true
}

Example room:

{
name: "B204",
building: "CE",
floor: 2,
type: "Lecture Hall"
}

Example path:

{
from: "node_01",
to: "node_02",
distance: 45,
accessible: true,
stairs: false,
elevator: false,
construction: false,
crowdLevel: "low"
}

27. DEMO CAMPUS DATA

Do not leave the application empty.

Populate it with a realistic fictional university.

Create at least:

10 buildings
30+ rooms
20+ landmarks
multiple floors
50+ navigation nodes
multiple paths
construction zones
crowd data
class schedule data
favorite destinations

The demo should work immediately after launching the application.

28. DEMO MODE

This is extremely important for the hackathon.

Create a:

🎮 DEMO MODE

toggle.

When enabled:

Automatically simulate GPS movement

Allow selecting predefined starting locations

Animate navigation

Simulate crowd updates

Simulate indoor positioning

Demonstrate floor changes

Demonstrate construction avoidance

Create a "Hackathon Demo" flow where judges can experience the entire product in approximately 2 minutes.

29. HACKATHON DEMO SCENARIO

Create a predefined demo:

START:
Main Gate

DESTINATION:
Lecture Hall B204

SYSTEM:

Detect user location.

Show user marker.

Search B204.

Calculate fastest route.

Show 4-minute ETA.

Display glowing 3D route.

Navigate through Block B.

Take elevator.

Switch from Ground Floor to Floor 2.

Avoid a construction zone.

Arrive at B204.

Show "You have arrived."

Display accessibility alternative.

Display crowd density.

Make this experience visually impressive.

30. ANIMATIONS

Use smooth animations throughout.

Required animations:

3D building entrance

Camera fly-to

Route drawing animation

Pulsing GPS marker

Moving navigation marker

Building hover glow

Floor transition

Search result animation

Page transitions

Glass panels appearing

Crowd heatmap animation

AI assistant opening

AR arrows

Arrival celebration

Use Framer Motion where appropriate.

Avoid excessive animations that reduce performance.

31. PERFORMANCE

Optimize the application.

Important:

Lazy load 3D scenes

Avoid unnecessary React renders

Dispose Three.js objects

Use instancing for repeated trees/lights

Compress assets where possible

Keep mobile performance acceptable

Display a loading screen while the 3D environment initializes

Add:

Loading Campus...

[ animated 3D logo ]

32. ERROR HANDLING

Handle:

GPS denied
GPS unavailable
camera denied
Firebase unavailable
missing destination
invalid route
no accessible route
construction blocking route

Always provide useful fallback messages.

Example:

"GPS unavailable. Switching to Campus Demo Position."

33. NAVIGATION STATES

Create these states:

IDLE
LOCATING
DESTINATION_SELECTED
ROUTE_CALCULATING
ROUTE_READY
NAVIGATING
FLOOR_CHANGE
ARRIVED
GPS_UNAVAILABLE
INDOOR_MODE

Use clear visual state transitions.

34. COMPONENT STRUCTURE

Organize components cleanly.

Suggested structure:

components/
campus/
CampusScene
Building
Road
Path
Landmark
UserMarker
RoutePath
FloorSelector
CrowdOverlay

navigation/
SearchBar
RoutePanel
NavigationCard
TurnInstruction
RouteOptions

dashboard/
Sidebar
TopBar
StatsCard

places/
schedule/
favorites/
ai/
ar/
admin/

lib/
routing/
gps/
firebase/
campus/
demo/

types/
campus.ts
routing.ts
user.ts

35. ACCESSIBILITY

Use semantic HTML.

Support:

Keyboard navigation

ARIA labels

High contrast

Focus states

Screen-reader-friendly controls

Reduced-motion preference

36. DESIGN DETAILS

Use rounded cards.

Use subtle borders.

Use glass blur.

Use modern typography.

Use Lucide icons.

Use meaningful micro-interactions.

Buttons should feel responsive.

Important navigation actions should be visually prominent.

The 3D campus should always remain the visual hero of the application.

37. NO PLACEHOLDER FEEL

Do NOT create a generic dashboard with empty cards.

Do NOT create a simple 2D map and call it 3D.

Do NOT create static fake screenshots.

The application must contain a real interactive Three.js/WebGL scene.

The campus should be clickable.

Buildings should respond to hover/click.

Routes should animate.

Floor switching should work.

Navigation should have state.

The demo should feel like a real product.

38. IMPORTANT MVP PRIORITIES

If all features cannot be implemented simultaneously, prioritize in this exact order:

Interactive 3D campus

Search destinations

GPS/demo positioning

Route calculation

Animated 3D navigation path

Multi-floor navigation

Accessible routing

Construction avoidance

Crowd density

Class schedule

Favorites

Admin dashboard

AI assistant

AR prototype

Indoor positioning prototype

Everything should remain visually connected to the core navigation experience.

39. FINAL UX GOAL

The final application should make a judge immediately understand:

"Instead of looking at a flat campus map, students can actually explore their university as a 3D digital environment and receive intelligent real-time navigation."

The final product should feel:

Futuristic
Useful
Interactive
Fast
Professional
Hackathon-ready
Scalable

Application name:

Campus3D Navigator

Tagline:

Your Campus. Your Route. In 3D.

Build the complete working MVP now with realistic demo data and polished UI.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://campus-flight.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e85c4644-6369-4de0-b993-bdeddc8e0b33).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
