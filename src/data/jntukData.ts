export type Resource =
  | { kind: "syllabus"; title: string; content: string[] }
  | { kind: "note"; title: string; url: string; fileType: "PDF" | "PPT"; size?: string }
  | { kind: "video"; title: string; channel: string; youtubeId: string; duration?: string }
  | { kind: "formula"; name: string; formula: string; usage: string }
  | { kind: "paper"; year: string; month: string; url: string };

export type Unit = {
  id: string;
  number: number;
  title: string;
  topics: string[];
  resources: Resource[];
};

export type Subject = {
  code: string;
  name: string;
  credits: number;
  units: Unit[];
};

export type Semester = {
  number: 1 | 2;
  subjects: Subject[];
};

export type Year = {
  number: 1 | 2 | 3 | 4;
  label: string;
  semesters: Semester[];
};

export type Branch = {
  code: string;
  name: string;
  emoji: string;
  years: Year[];
};

export type Regulation = {
  code: "R20" | "R23";
  label: string;
  description: string;
  branches: Branch[];
};

// ---------- helpers ----------
const mkUnit = (n: number, title: string, topics: string[]): Unit => ({
  id: `u${n}`,
  number: n,
  title: `Unit ${n} — ${title}`,
  topics,
  resources: [
    { kind: "syllabus", title: `Unit ${n}: ${title}`, content: topics },
    { kind: "note", title: `${title} — Notes`, url: "#", fileType: "PDF", size: "—" },
    { kind: "video", title: `${title} — Lecture`, channel: "JNTU Lectures", youtubeId: "dQw4w9WgXcQ", duration: "—" },
    { kind: "paper", year: "2023", month: "May", url: "#" },
  ],
});

const mkSubject = (code: string, name: string, units: Unit[], credits = 3): Subject => ({
  code,
  name,
  credits,
  units,
});

// Generic 5-unit pattern when only headings are known
const genericUnits = (theme: string): Unit[] => [
  mkUnit(1, `${theme} — Basics`, ["Introduction", "Core terminology", "Foundational concepts"]),
  mkUnit(2, `${theme} — Design`, ["Design principles", "Architectures", "Standard models"]),
  mkUnit(3, `${theme} — Advanced Topics`, ["Advanced concepts", "Specialized techniques"]),
  mkUnit(4, `${theme} — Applications`, ["Real-world use cases", "Industry examples"]),
  mkUnit(5, `${theme} — Optimization`, ["Performance tuning", "Best practices", "Case studies"]),
];

// ============================================================
// R20 — Common 1st Year
// ============================================================
const R20_Y1S1: Subject[] = [
  mkSubject("MA101", "Mathematics-I", [
    mkUnit(1, "Matrices", ["Rank of a matrix", "Echelon & normal forms", "System of linear equations", "Eigenvalues & eigenvectors", "Cayley–Hamilton theorem"]),
    mkUnit(2, "Differential Calculus", ["Rolle's, Mean Value theorems", "Taylor's & Maclaurin's series", "Functions of several variables", "Partial differentiation", "Jacobians"]),
    mkUnit(3, "Applications of Derivatives", ["Maxima & minima", "Lagrange multipliers", "Curvature & evolutes", "Envelopes", "Curve tracing"]),
    mkUnit(4, "Integral Calculus", ["Definite integrals & properties", "Reduction formulae", "Beta & Gamma functions", "Applications to area & length", "Volumes of revolution"]),
    mkUnit(5, "Multiple Integrals", ["Double integrals", "Change of order of integration", "Change of variables", "Triple integrals", "Applications to area & volume"]),
  ], 4),
  mkSubject("PH102", "Applied Physics", [
    mkUnit(1, "Wave Optics", ["Interference", "Newton's rings", "Diffraction (Fraunhofer)", "Diffraction grating", "Polarization"]),
    mkUnit(2, "Lasers & Fiber Optics", ["Spontaneous & stimulated emission", "Einstein coefficients", "Ruby & He-Ne lasers", "Optical fiber principles", "Fiber communication & losses"]),
    mkUnit(3, "Quantum Mechanics", ["Wave–particle duality", "de Broglie hypothesis", "Heisenberg uncertainty", "Schrödinger equation", "Particle in a box"]),
    mkUnit(4, "Semiconductors", ["Intrinsic & extrinsic semiconductors", "Carrier concentration", "Hall effect", "p-n junction", "Direct & indirect bandgap"]),
    mkUnit(5, "Nanotechnology", ["Nanomaterials & properties", "Synthesis (top-down/bottom-up)", "CNTs & quantum dots", "Characterization (SEM, TEM)", "Applications"]),
  ], 4),
  mkSubject("CS103", "Programming for Problem Solving (C)", [
    mkUnit(1, "Basics of C", ["History & structure of C", "Data types & variables", "Operators & expressions", "I/O functions", "Simple programs"]),
    mkUnit(2, "Control Structures", ["if, if-else, switch", "while, do-while, for", "break & continue", "goto", "Nested control structures"]),
    mkUnit(3, "Arrays & Strings", ["1D & 2D arrays", "Array operations", "Strings & string functions", "Multi-dimensional arrays", "Sorting & searching"]),
    mkUnit(4, "Functions", ["Function definition & call", "Parameter passing", "Recursion", "Storage classes", "Scope & lifetime"]),
    mkUnit(5, "Pointers", ["Pointer basics", "Pointers & arrays", "Dynamic memory allocation", "Structures & unions", "File handling"]),
  ], 3),
  mkSubject("ME104", "Engineering Drawing", [
    mkUnit(1, "Basics", ["Drawing instruments", "Lettering & dimensioning", "Scales", "Conic sections", "Engineering curves"]),
    mkUnit(2, "Projections", ["Projection of points", "Projection of lines", "Projection of planes", "Projection of solids", "Auxiliary projections"]),
    mkUnit(3, "Sections", ["Sections of solids", "True shape of section", "Sectional views", "Cutting plane positions", "Practice problems"]),
    mkUnit(4, "Development", ["Development of surfaces", "Prisms & cylinders", "Pyramids & cones", "Truncated solids", "Sheet metal applications"]),
    mkUnit(5, "Isometric", ["Isometric projection", "Isometric views from orthographic", "Conversion of views", "AutoCAD basics", "Computer-aided drawing"]),
  ], 3),
];

const R20_Y1S2: Subject[] = [
  mkSubject("MA201", "Mathematics-II", [
    mkUnit(1, "Laplace Transforms", ["Definition & properties", "Transforms of standard functions", "Inverse Laplace transforms", "Convolution theorem", "Application to ODEs"]),
    mkUnit(2, "Fourier Series", ["Periodic functions", "Dirichlet conditions", "Fourier series of even/odd functions", "Half-range series", "Harmonic analysis"]),
    mkUnit(3, "Differential Equations", ["First order ODEs", "Linear higher-order ODEs", "Method of variation of parameters", "Cauchy–Euler equation", "Applications"]),
    mkUnit(4, "Probability", ["Random variables", "Probability distributions", "Binomial & Poisson", "Normal distribution", "Expectation & variance"]),
    mkUnit(5, "Statistics", ["Measures of central tendency", "Correlation & regression", "Curve fitting", "Tests of hypothesis", "Chi-square test"]),
  ], 4),
  mkSubject("CH202", "Applied Chemistry", [
    mkUnit(1, "Water Technology", ["Hardness of water", "Boiler troubles", "Softening methods (lime-soda, zeolite, ion-exchange)", "Desalination", "Specifications for drinking water"]),
    mkUnit(2, "Polymers", ["Classification & types", "Polymerization mechanisms", "Plastics: thermo & thermosetting", "Elastomers", "Conducting & biodegradable polymers"]),
    mkUnit(3, "Electrochemistry", ["Electrode potential", "Electrochemical cells", "Nernst equation", "Reference electrodes", "Batteries & fuel cells"]),
    mkUnit(4, "Corrosion", ["Mechanisms (chemical & electrochemical)", "Types of corrosion", "Factors influencing corrosion", "Cathodic protection", "Protective coatings"]),
    mkUnit(5, "Nanomaterials", ["Introduction to nanomaterials", "Synthesis methods", "Characterization", "Carbon nanotubes & graphene", "Engineering applications"]),
  ], 4),
  mkSubject("EE203", "Basic Electrical Engineering", [
    mkUnit(1, "DC Circuits", ["Ohm's law & Kirchhoff's laws", "Mesh & nodal analysis", "Star-delta transformation", "Network theorems", "DC network problems"]),
    mkUnit(2, "AC Circuits", ["Generation of AC", "RMS & average values", "Series & parallel RLC circuits", "Resonance", "Three-phase systems"]),
    mkUnit(3, "Transformers", ["Construction & principle", "EMF equation", "Transformer on no-load & load", "Equivalent circuit", "Efficiency & regulation"]),
    mkUnit(4, "Machines", ["DC generators & motors", "Three-phase induction motors", "Synchronous machines", "Single-phase motors", "Applications"]),
    mkUnit(5, "Measurements", ["Moving coil & moving iron instruments", "Wattmeter & energy meter", "Megger", "CT & PT", "Digital instruments"]),
  ], 3),
];

const R20_Year1: Year = {
  number: 1,
  label: "1st Year",
  semesters: [
    { number: 1, subjects: R20_Y1S1 },
    { number: 2, subjects: R20_Y1S2 },
  ],
};

// ============================================================
// R20 — 2nd Year per branch
// ============================================================
const cseLike_Y2S1: Subject[] = [
  mkSubject("CS301", "Data Structures", [
    mkUnit(1, "Basics & Complexity", ["Abstract data types", "Time & space complexity", "Asymptotic notations", "Recursion", "Algorithm analysis"]),
    mkUnit(2, "Arrays & Linked Lists", ["Array operations", "Singly linked list", "Doubly & circular linked lists", "Applications", "Polynomial representation"]),
    mkUnit(3, "Stack & Queue", ["Stack ADT & applications", "Infix to postfix conversion", "Queue ADT", "Circular & priority queues", "Deque"]),
    mkUnit(4, "Trees", ["Binary trees & traversals", "Binary search trees", "AVL trees", "B-trees", "Heap & heap sort"]),
    mkUnit(5, "Graphs", ["Graph representations", "BFS & DFS", "Shortest path (Dijkstra)", "MST (Prim, Kruskal)", "Topological sort"]),
  ], 4),
  mkSubject("EC302", "Digital Logic Design", [
    mkUnit(1, "Boolean Algebra", ["Number systems & codes", "Boolean theorems", "Logic gates", "K-map simplification", "Quine–McCluskey method"]),
    mkUnit(2, "Combinational Circuits", ["Adders & subtractors", "Multiplexers & demultiplexers", "Encoders & decoders", "Comparators", "Code converters"]),
    mkUnit(3, "Sequential Circuits", ["Latches & flip-flops", "Master-slave FF", "Excitation tables", "State diagrams", "FSM design"]),
    mkUnit(4, "Registers", ["Shift registers", "Universal shift register", "Counters: synchronous & asynchronous", "Ring & Johnson counters", "Applications"]),
    mkUnit(5, "Memory", ["RAM & ROM organization", "PLA & PAL", "FPGA basics", "Memory hierarchy", "Cache memory"]),
  ], 3),
];
const cseLike_Y2S2: Subject[] = [
  mkSubject("CS401", "Computer Organization", genericUnits("Computer Organization"), 3),
  mkSubject("CS402", "Object Oriented Programming (Java/C++)", genericUnits("OOP")),
  mkSubject("MA403", "Discrete Mathematics", genericUnits("Discrete Mathematics")),
];

const ece_Y2S1: Subject[] = [
  mkSubject("EC301", "Signals & Systems", [
    mkUnit(1, "Signals", ["Continuous & discrete signals", "Standard signals", "Operations on signals", "Classification", "Energy & power signals"]),
    mkUnit(2, "Systems", ["LTI systems", "Properties: linearity, causality", "Impulse response", "Convolution", "System interconnections"]),
    mkUnit(3, "Fourier Analysis", ["Fourier series", "Fourier transform & properties", "Frequency response", "Sampling theorem", "DTFT basics"]),
    mkUnit(4, "Laplace Transform", ["Laplace transform & ROC", "Properties", "Inverse Laplace", "Transfer function", "System stability"]),
    mkUnit(5, "Applications", ["Filter design basics", "Z-transform introduction", "Communication signal analysis", "Control system applications", "Case studies"]),
  ], 4),
  mkSubject("EC302", "Network Theory", genericUnits("Network Theory")),
];
const ece_Y2S2: Subject[] = [
  mkSubject("EC401", "Analog Circuits", genericUnits("Analog Circuits")),
  mkSubject("EC402", "Electronic Devices", genericUnits("Electronic Devices")),
];

const eee_Y2S1: Subject[] = [
  mkSubject("EE301", "Electrical Circuits", genericUnits("Electrical Circuits")),
  mkSubject("EE302", "Electrical Machines-I", genericUnits("Electrical Machines-I")),
];
const eee_Y2S2: Subject[] = [
  mkSubject("EE401", "Control Systems", genericUnits("Control Systems")),
  mkSubject("EE402", "Power Systems", genericUnits("Power Systems")),
];

const mech_Y2S1: Subject[] = [
  mkSubject("ME301", "Thermodynamics", genericUnits("Thermodynamics")),
  mkSubject("ME302", "Fluid Mechanics", genericUnits("Fluid Mechanics")),
];
const mech_Y2S2: Subject[] = [
  mkSubject("ME401", "Manufacturing Process", genericUnits("Manufacturing Process")),
  mkSubject("ME402", "Kinematics of Machinery", genericUnits("Kinematics")),
];

const civil_Y2S1: Subject[] = [
  mkSubject("CE301", "Strength of Materials", genericUnits("Strength of Materials")),
  mkSubject("CE302", "Fluid Mechanics", genericUnits("Fluid Mechanics")),
];
const civil_Y2S2: Subject[] = [
  mkSubject("CE401", "Surveying", genericUnits("Surveying")),
  mkSubject("CE402", "Structural Analysis", genericUnits("Structural Analysis")),
];

// ============================================================
// R20 — 3rd Year per branch
// ============================================================
const cseLike_Y3S1: Subject[] = [
  mkSubject("CS501", "Database Management Systems", [
    mkUnit(1, "ER Model", ["Introduction to DBMS", "ER diagrams", "Entities, attributes, relationships", "Generalization & specialization", "Reduction to tables"]),
    mkUnit(2, "SQL", ["DDL, DML, DCL", "Joins & sub-queries", "Views & indexes", "Integrity constraints", "Stored procedures"]),
    mkUnit(3, "Transactions", ["ACID properties", "Concurrency control", "Locking protocols", "Deadlock handling", "Recovery techniques"]),
    mkUnit(4, "Indexing & Normalization", ["Functional dependencies", "Normal forms (1NF–BCNF)", "B+ trees", "Hashing", "Query optimization"]),
    mkUnit(5, "NoSQL", ["NoSQL types", "MongoDB basics", "CAP theorem", "Big Data overview", "Use cases"]),
  ], 4),
  mkSubject("CS502", "Operating Systems", [
    mkUnit(1, "Processes", ["OS structure & services", "Process concept", "Process control block", "Inter-process communication", "Threads"]),
    mkUnit(2, "Scheduling", ["CPU scheduling criteria", "FCFS, SJF, RR, Priority", "Multilevel queues", "Multiprocessor scheduling", "Examples"]),
    mkUnit(3, "Memory", ["Contiguous allocation", "Paging & segmentation", "Virtual memory", "Page replacement algorithms", "Thrashing"]),
    mkUnit(4, "Deadlocks", ["System model", "Deadlock characterization", "Prevention & avoidance", "Banker's algorithm", "Detection & recovery"]),
    mkUnit(5, "File Systems", ["File concepts & access methods", "Directory structures", "Disk scheduling", "RAID", "Protection & security"]),
  ], 3),
  mkSubject("CS503", "Computer Networks", [
    mkUnit(1, "OSI Model", ["Network goals & applications", "OSI reference model", "TCP/IP model", "Topologies", "Transmission media"]),
    mkUnit(2, "TCP/IP", ["IP addressing & subnetting", "IPv4 & IPv6", "TCP & UDP", "Sockets", "ARP/RARP/ICMP"]),
    mkUnit(3, "Routing", ["Routing algorithms", "Distance vector & link state", "RIP, OSPF, BGP", "Multicast routing", "MPLS basics"]),
    mkUnit(4, "Congestion Control", ["Flow vs congestion control", "Leaky & token bucket", "TCP congestion control", "QoS", "Traffic shaping"]),
    mkUnit(5, "Security", ["Cryptography basics", "Symmetric & asymmetric ciphers", "Digital signatures", "SSL/TLS", "Firewalls & IDS"]),
  ], 3),
];
const ece_Y3S1: Subject[] = [
  mkSubject("EC501", "Digital Communication", genericUnits("Digital Communication")),
  mkSubject("EC502", "Microprocessors & Microcontrollers", genericUnits("Microprocessors")),
  mkSubject("EC503", "VLSI Design", genericUnits("VLSI")),
];
const eee_Y3S1: Subject[] = [
  mkSubject("EE501", "Power Electronics", genericUnits("Power Electronics")),
  mkSubject("EE502", "Electric Drives", genericUnits("Drives")),
  mkSubject("EE503", "Control Systems", genericUnits("Control Systems")),
];
const mech_Y3S1: Subject[] = [
  mkSubject("ME501", "Heat Transfer", genericUnits("Heat Transfer")),
  mkSubject("ME502", "Machine Design", genericUnits("Machine Design")),
];
const civil_Y3S1: Subject[] = [
  mkSubject("CE501", "Geotechnical Engineering", genericUnits("Geotechnical")),
  mkSubject("CE502", "Environmental Engineering", genericUnits("Environmental")),
];

// 3-2 generic (open electives + advanced)
const advanced_Y3S2 = (prefix: string): Subject[] => [
  mkSubject(`${prefix}601`, "Professional Elective – I", genericUnits("Professional Elective I")),
  mkSubject(`${prefix}602`, "Open Elective – I", genericUnits("Open Elective I")),
];

// ============================================================
// R20 — 4th Year (common)
// ============================================================
const Y4_R20 = (prefix: string): Year => ({
  number: 4,
  label: "4th Year",
  semesters: [
    {
      number: 1,
      subjects: [
        mkSubject(`${prefix}701`, "Professional Elective – II (AI / IoT / EV / Cloud)", genericUnits("Professional Elective II")),
        mkSubject(`${prefix}702`, "Open Elective – II", genericUnits("Open Elective II")),
        mkSubject(`${prefix}703`, "Mini Project", [
          mkUnit(1, "Problem Identification", ["Domain study", "Problem statement", "Scope & feasibility"]),
          mkUnit(2, "Literature Survey", ["Existing solutions", "Gap analysis", "Reference papers"]),
          mkUnit(3, "Design", ["System architecture", "Module design", "UML diagrams"]),
          mkUnit(4, "Implementation", ["Tools & technologies", "Coding & testing", "Integration"]),
          mkUnit(5, "Evaluation", ["Results & analysis", "Demo", "Report & presentation"]),
        ]),
      ],
    },
    {
      number: 2,
      subjects: [
        mkSubject(`${prefix}801`, "Major Project", [
          mkUnit(1, "Proposal", ["Topic finalization", "Objectives", "Methodology"]),
          mkUnit(2, "Design Phase", ["Architecture", "Detailed design", "Tech stack"]),
          mkUnit(3, "Development", ["Module-wise development", "Version control", "Code reviews"]),
          mkUnit(4, "Testing", ["Unit & integration tests", "User acceptance", "Bug fixing"]),
          mkUnit(5, "Submission", ["Final report", "Publication", "Viva-voce"]),
        ], 8),
        mkSubject(`${prefix}802`, "Industry-Oriented Internship", genericUnits("Internship")),
      ],
    },
  ],
});

// ============================================================
// Branch builder for R20
// ============================================================
const buildR20Branch = (
  code: string,
  name: string,
  emoji: string,
  y2s1: Subject[],
  y2s2: Subject[],
  y3s1: Subject[],
): Branch => ({
  code,
  name,
  emoji,
  years: [
    R20_Year1,
    {
      number: 2,
      label: "2nd Year",
      semesters: [
        { number: 1, subjects: y2s1 },
        { number: 2, subjects: y2s2 },
      ],
    },
    {
      number: 3,
      label: "3rd Year",
      semesters: [
        { number: 1, subjects: y3s1 },
        { number: 2, subjects: advanced_Y3S2(code) },
      ],
    },
    Y4_R20(code),
  ],
});

const r20Branches: Branch[] = [
  buildR20Branch("CSE", "Computer Science Engineering", "💻", cseLike_Y2S1, cseLike_Y2S2, cseLike_Y3S1),
  buildR20Branch("IT", "Information Technology", "🖥️", cseLike_Y2S1, cseLike_Y2S2, cseLike_Y3S1),
  buildR20Branch("AIDS", "AI & Data Science", "🧠", cseLike_Y2S1, cseLike_Y2S2, cseLike_Y3S1),
  buildR20Branch("AIML", "AI & Machine Learning", "🤖", cseLike_Y2S1, cseLike_Y2S2, cseLike_Y3S1),
  buildR20Branch("DS", "Data Science", "📊", cseLike_Y2S1, cseLike_Y2S2, cseLike_Y3S1),
  buildR20Branch("ECE", "Electronics & Communication", "📡", ece_Y2S1, ece_Y2S2, ece_Y3S1),
  buildR20Branch("EEE", "Electrical & Electronics", "⚡", eee_Y2S1, eee_Y2S2, eee_Y3S1),
  buildR20Branch("MECH", "Mechanical Engineering", "⚙️", mech_Y2S1, mech_Y2S2, mech_Y3S1),
  buildR20Branch("CIVIL", "Civil Engineering", "🏗️", civil_Y2S1, civil_Y2S2, civil_Y3S1),
];

// ============================================================
// R23 — Modern Foundation
// ============================================================
const R23_Y1S1: Subject[] = [
  mkSubject("MA101", "Mathematics", [
    mkUnit(1, "Basics", ["Matrices & determinants", "Linear equations", "Vector spaces basics"]),
    mkUnit(2, "Tools", ["Calculus essentials", "Differentiation tools", "Integration techniques"]),
    mkUnit(3, "Applications", ["Engineering applications", "Curve fitting", "Optimization basics"]),
    mkUnit(4, "Problem Solving", ["Modeling problems", "Numerical methods overview", "Worked examples"]),
    mkUnit(5, "Case Studies", ["Real-world data problems", "Industry case studies", "Mini exercises"]),
  ], 4),
  mkSubject("CS102", "Computational Thinking (Python)", [
    mkUnit(1, "Basics", ["Python syntax", "Variables & data types", "Operators & I/O"]),
    mkUnit(2, "Tools", ["Control flow", "Functions & modules", "List/dict/set/tuple"]),
    mkUnit(3, "Applications", ["File handling", "Exception handling", "OOP basics"]),
    mkUnit(4, "Problem Solving", ["Algorithmic thinking", "Recursion", "Standard libraries"]),
    mkUnit(5, "Case Studies", ["NumPy/Pandas intro", "Data tasks", "Mini projects"]),
  ], 3),
  mkSubject("EX103", "Engineering Exploration", [
    mkUnit(1, "Basics", ["Branches of engineering", "Engineering ethics", "Sustainability"]),
    mkUnit(2, "Tools", ["Design thinking", "CAD/Tinkering basics", "Prototyping tools"]),
    mkUnit(3, "Applications", ["Cross-domain projects", "Maker culture", "Hands-on exercises"]),
    mkUnit(4, "Problem Solving", ["Identifying problems", "Ideation methods", "MVP approach"]),
    mkUnit(5, "Case Studies", ["Industry showcases", "Startup case studies", "Team project"]),
  ], 2),
  mkSubject("PH104", "Physics / Chemistry", [
    mkUnit(1, "Basics", ["Foundational principles", "Units & measurements", "Lab safety"]),
    mkUnit(2, "Tools", ["Instruments & techniques", "Measurement standards", "Lab tools"]),
    mkUnit(3, "Applications", ["Engineering materials", "Energy & devices", "Sensors"]),
    mkUnit(4, "Problem Solving", ["Numerical problems", "Experimental analysis", "Error analysis"]),
    mkUnit(5, "Case Studies", ["Industry use cases", "Research highlights", "Group activity"]),
  ], 4),
];

const R23_Y1S2: Subject[] = [
  mkSubject("DS201", "Data Science Basics", [
    mkUnit(1, "Basics", ["What is data science?", "Data types & sources", "Data lifecycle"]),
    mkUnit(2, "Tools", ["Python for DS", "Pandas & NumPy", "Visualization basics"]),
    mkUnit(3, "Applications", ["EDA", "Cleaning & preprocessing", "Feature engineering"]),
    mkUnit(4, "Problem Solving", ["Statistical inference", "Hypothesis testing", "Intro to ML"]),
    mkUnit(5, "Case Studies", ["End-to-end mini project", "Domain examples", "Ethics in DS"]),
  ], 3),
  mkSubject("EC202", "Basic Electronics", [
    mkUnit(1, "Basics", ["Semiconductors", "Diodes", "Rectifiers"]),
    mkUnit(2, "Tools", ["BJT & FET basics", "Biasing", "Small-signal models"]),
    mkUnit(3, "Applications", ["Amplifiers", "Op-amp basics", "Filters"]),
    mkUnit(4, "Problem Solving", ["Logic gates", "Combinational circuits", "Sequential circuits"]),
    mkUnit(5, "Case Studies", ["Embedded examples", "IoT prototypes", "Industry use cases"]),
  ], 3),
  mkSubject("ME203", "Engineering Mechanics", [
    mkUnit(1, "Basics", ["Force systems", "Equilibrium", "Free body diagrams"]),
    mkUnit(2, "Tools", ["Friction", "Centroid & moment of inertia", "Trusses"]),
    mkUnit(3, "Applications", ["Beams & supports", "Structural problems", "Machinery basics"]),
    mkUnit(4, "Problem Solving", ["Kinematics of particles", "Kinetics", "Work-energy methods"]),
    mkUnit(5, "Case Studies", ["Mechanical design examples", "Civil structures", "Group exercise"]),
  ], 3),
];

const R23_Year1: Year = {
  number: 1,
  label: "1st Year",
  semesters: [
    { number: 1, subjects: R23_Y1S1 },
    { number: 2, subjects: R23_Y1S2 },
  ],
};

// R23 2nd Year
const r23_cseLike_Y2S1: Subject[] = [
  mkSubject("CS301", "Data Structures", cseLike_Y2S1[0].units, 4),
  mkSubject("CS302", "Python Advanced", [
    mkUnit(1, "Basics", ["Advanced functions", "Decorators", "Generators"]),
    mkUnit(2, "Tools", ["Modules & packaging", "Virtual environments", "Testing (pytest)"]),
    mkUnit(3, "Applications", ["File & web I/O", "REST APIs (requests)", "Async basics"]),
    mkUnit(4, "Problem Solving", ["Data processing with Pandas", "NumPy in depth", "Visualization"]),
    mkUnit(5, "Case Studies", ["Web scraping project", "ML pipeline", "Deployment basics"]),
  ], 3),
  mkSubject("CS303", "Database Management Systems", cseLike_Y3S1[0].units, 4),
];
const r23_cseLike_Y2S2: Subject[] = [
  mkSubject("CS401", "Operating Systems", cseLike_Y3S1[1].units, 3),
  mkSubject("CS402", "Computer Networks", cseLike_Y3S1[2].units, 3),
  mkSubject("CS403", "Software Engineering", genericUnits("Software Engineering")),
];

const r23_ece_Y2S1: Subject[] = [
  mkSubject("EC301", "Circuits + Simulation Tools", [
    mkUnit(1, "Basics", ["Circuit elements", "KCL/KVL", "Mesh & nodal analysis"]),
    mkUnit(2, "Tools", ["LTspice/Multisim intro", "Simulation workflow", "DC/AC analysis"]),
    mkUnit(3, "Applications", ["Filters", "Oscillators", "Amplifier circuits"]),
    mkUnit(4, "Problem Solving", ["Transient analysis", "Frequency response", "Design exercises"]),
    mkUnit(5, "Case Studies", ["PCB-ready designs", "Industry tools", "Mini project"]),
  ], 4),
  mkSubject("EC302", "Embedded Basics", [
    mkUnit(1, "Basics", ["Microcontroller architecture", "GPIO", "Timers & interrupts"]),
    mkUnit(2, "Tools", ["Arduino/ESP32", "Embedded C", "Toolchains"]),
    mkUnit(3, "Applications", ["Sensors & actuators", "Communication (UART, I2C, SPI)", "Display interfaces"]),
    mkUnit(4, "Problem Solving", ["RTOS basics", "Power management", "Debugging"]),
    mkUnit(5, "Case Studies", ["IoT device", "Wearable prototype", "Smart home demo"]),
  ], 3),
];
const r23_ece_Y2S2: Subject[] = [
  mkSubject("EC401", "Signals & Systems", ece_Y2S1[0].units, 4),
  mkSubject("EC402", "Analog & Digital Communication", genericUnits("Communication")),
];

const r23_eee_Y2S1 = r23_ece_Y2S1;
const r23_eee_Y2S2: Subject[] = [
  mkSubject("EE401", "Electrical Machines", genericUnits("Electrical Machines")),
  mkSubject("EE402", "Power Electronics", genericUnits("Power Electronics")),
];

const r23_mech_Y2S1: Subject[] = [
  mkSubject("ME301", "Thermodynamics with Labs", genericUnits("Thermodynamics")),
  mkSubject("ME302", "Manufacturing Processes with Labs", genericUnits("Manufacturing")),
];
const r23_mech_Y2S2: Subject[] = [
  mkSubject("ME401", "Fluid Mechanics & Machinery", genericUnits("Fluid Mechanics")),
  mkSubject("ME402", "Machine Drawing (CAD)", genericUnits("Machine Drawing")),
];

const r23_civil_Y2S1: Subject[] = [
  mkSubject("CE301", "Strength of Materials with Labs", genericUnits("Strength of Materials")),
  mkSubject("CE302", "Surveying with Modern Tools", genericUnits("Surveying")),
];
const r23_civil_Y2S2: Subject[] = [
  mkSubject("CE401", "Structural Analysis", genericUnits("Structural Analysis")),
  mkSubject("CE402", "Concrete Technology", genericUnits("Concrete Technology")),
];

// R23 3rd Year — Skill focus
const skillUnits = (theme: string): Unit[] => [
  mkUnit(1, `${theme} — Concept`, ["Foundational concepts", "Terminology", "Motivation"]),
  mkUnit(2, `${theme} — Algorithm`, ["Core algorithms", "Mathematical foundation", "Pseudocode"]),
  mkUnit(3, `${theme} — Implementation`, ["Coding the algorithm", "Frameworks", "Hands-on labs"]),
  mkUnit(4, `${theme} — Tools`, ["Industry tools", "Libraries & SDKs", "Cloud/dev setup"]),
  mkUnit(5, `${theme} — Case Study`, ["Real deployment", "Domain example", "Mini project"]),
];

const r23_Y3S1_skills: Subject[] = [
  mkSubject("AI501", "AI / Machine Learning", skillUnits("AI/ML"), 4),
  mkSubject("CC502", "Cloud Computing", skillUnits("Cloud Computing")),
  mkSubject("CY503", "Cybersecurity", skillUnits("Cybersecurity")),
];
const r23_Y3S2_skills: Subject[] = [
  mkSubject("ES601", "Embedded Systems", skillUnits("Embedded Systems")),
  mkSubject("EV602", "EV Technology", skillUnits("EV Technology")),
  mkSubject("EL603", "Professional Elective", skillUnits("Professional Elective")),
];

// R23 4th Year — Industry oriented
const Y4_R23 = (prefix: string): Year => ({
  number: 4,
  label: "4th Year",
  semesters: [
    {
      number: 1,
      subjects: [
        mkSubject(`${prefix}701`, "Internship", [
          mkUnit(1, "Onboarding", ["Company orientation", "Tools & workflow", "Mentor assignment"]),
          mkUnit(2, "Skill Mapping", ["Tech stack", "Process learning", "Code standards"]),
          mkUnit(3, "Project Work", ["Assigned tasks", "Sprints", "Reviews"]),
          mkUnit(4, "Deliverables", ["Documentation", "Demos", "Handover"]),
          mkUnit(5, "Evaluation", ["Mentor feedback", "Report submission", "Viva"]),
        ], 4),
        mkSubject(`${prefix}702`, "Open Elective", skillUnits("Open Elective")),
      ],
    },
    {
      number: 2,
      subjects: [
        mkSubject(`${prefix}801`, "Real-time Project", [
          mkUnit(1, "Proposal", ["Industry problem", "Stakeholders", "Scope"]),
          mkUnit(2, "Design", ["Architecture", "Stack selection", "Risk analysis"]),
          mkUnit(3, "Build", ["Sprint development", "CI/CD", "Reviews"]),
          mkUnit(4, "Deploy", ["Cloud deployment", "Monitoring", "Scaling"]),
          mkUnit(5, "Evaluate", ["KPIs", "User feedback", "Final report"]),
        ], 8),
        mkSubject(`${prefix}802`, "Research / Startup Work", [
          mkUnit(1, "Ideation", ["Problem discovery", "Market research", "Validation"]),
          mkUnit(2, "Literature", ["State-of-the-art", "Patents", "Gap analysis"]),
          mkUnit(3, "Prototype", ["MVP build", "User testing", "Iteration"]),
          mkUnit(4, "Pitch", ["Business model", "Pitch deck", "Funding basics"]),
          mkUnit(5, "Outcome", ["Publication / launch", "Reflection", "Next steps"]),
        ]),
      ],
    },
  ],
});

const buildR23Branch = (
  code: string,
  name: string,
  emoji: string,
  y2s1: Subject[],
  y2s2: Subject[],
): Branch => ({
  code,
  name,
  emoji,
  years: [
    R23_Year1,
    {
      number: 2,
      label: "2nd Year",
      semesters: [
        { number: 1, subjects: y2s1 },
        { number: 2, subjects: y2s2 },
      ],
    },
    {
      number: 3,
      label: "3rd Year",
      semesters: [
        { number: 1, subjects: r23_Y3S1_skills },
        { number: 2, subjects: r23_Y3S2_skills },
      ],
    },
    Y4_R23(code),
  ],
});

const r23Branches: Branch[] = [
  buildR23Branch("CSE", "Computer Science Engineering", "💻", r23_cseLike_Y2S1, r23_cseLike_Y2S2),
  buildR23Branch("IT", "Information Technology", "🖥️", r23_cseLike_Y2S1, r23_cseLike_Y2S2),
  buildR23Branch("AIDS", "AI & Data Science", "🧠", r23_cseLike_Y2S1, r23_cseLike_Y2S2),
  buildR23Branch("AIML", "AI & Machine Learning", "🤖", r23_cseLike_Y2S1, r23_cseLike_Y2S2),
  buildR23Branch("DS", "Data Science", "📊", r23_cseLike_Y2S1, r23_cseLike_Y2S2),
  buildR23Branch("ECE", "Electronics & Communication", "📡", r23_ece_Y2S1, r23_ece_Y2S2),
  buildR23Branch("EEE", "Electrical & Electronics", "⚡", r23_eee_Y2S1, r23_eee_Y2S2),
  buildR23Branch("MECH", "Mechanical Engineering", "⚙️", r23_mech_Y2S1, r23_mech_Y2S2),
  buildR23Branch("CIVIL", "Civil Engineering", "🏗️", r23_civil_Y2S1, r23_civil_Y2S2),
];

export const regulations: Regulation[] = [
  {
    code: "R20",
    label: "R20 Regulation",
    description: "2020 Batch & Onwards",
    branches: r20Branches,
  },
  {
    code: "R23",
    label: "R23 Regulation",
    description: "2023 Batch & Onwards — Modern AI/ML/DS Curriculum",
    branches: r23Branches,
  },
];
