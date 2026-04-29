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
// R23 — 1st Year (verified from official JNTUK R23 Regulations PDF)
// Group A = CSE, EEE, Chemical, Food Tech, Petroleum, Pharmaceutical Engg
// Group B = Civil, Mech, Mining, Auto, Robotics, ECE & allied,
//           CSE-Allied & IT (includes IT, AIDS, AIML, DS), Agriculture
// ============================================================

// Common subjects (identical content across both groups)
const R23_CommunicativeEnglish = mkSubject("HS101", "Communicative English", [
  mkUnit(1, "Human Values — Gift of the Magi", [
    "Listening: identifying topic, context & specific information",
    "Speaking: introducing self & others, general questions",
    "Reading: skimming & scanning",
    "Writing: capitalization, spellings, punctuation, parts of sentence",
    "Grammar: parts of speech, basic sentence structures, forming questions",
    "Vocabulary: synonyms, antonyms, affixes, root words",
  ]),
  mkUnit(2, "Nature — The Brook by Alfred Tennyson", [
    "Listening for main & supporting ideas",
    "Speaking: pair/group discussion, short structured talks",
    "Reading: identifying sequence of ideas, verbal techniques",
    "Writing: structure of a paragraph, paragraph writing",
    "Grammar: cohesive devices (linkers), articles, prepositions",
    "Vocabulary: homonyms, homophones, homographs",
  ]),
  mkUnit(3, "Biography — Elon Musk", [
    "Listening for global comprehension & summarizing",
    "Speaking: discussing topics & reporting in pairs/groups",
    "Reading: detailed reading, basic inferences, context clues",
    "Writing: summarizing, note-making, paraphrasing",
    "Grammar: tenses, subject-verb agreement",
    "Vocabulary: compound words, collocations",
  ]),
  mkUnit(4, "Inspiration — The Toys of Peace by Saki", [
    "Listening: making predictions during conversations / video",
    "Speaking: role plays for academic conversational English",
    "Reading: graphic elements in texts (charts, trends, processes)",
    "Writing: official letters, resumes",
    "Grammar: reporting verbs, direct & indirect speech, active & passive voice",
    "Vocabulary: words often confused, jargons",
  ]),
  mkUnit(5, "Motivation — The Power of Intrapersonal Communication", [
    "Listening: identifying key terms & concepts",
    "Speaking: formal oral presentations on academic topics",
    "Reading: reading comprehension",
    "Writing: structured essay writing",
    "Grammar: editing texts, common errors (articles, prepositions, tenses, SVA)",
    "Vocabulary: technical jargons",
  ]),
], 2);

const R23_LinearAlgebraCalculus = mkSubject("MA102", "Linear Algebra & Calculus", [
  mkUnit(1, "Matrices", [
    "Rank of a matrix by echelon form & normal form",
    "Cauchy–Binet formulae (without proof)",
    "Inverse of non-singular matrices by Gauss-Jordan method",
    "System of linear equations: homogeneous & non-homogeneous (Gauss elimination)",
    "Iterative methods: Jacobi & Gauss-Seidel",
  ]),
  mkUnit(2, "Eigenvalues, Eigenvectors and Orthogonal Transformation", [
    "Eigenvalues, eigenvectors and their properties",
    "Diagonalization of a matrix",
    "Cayley-Hamilton theorem (without proof) — inverse and powers",
    "Quadratic forms and their nature",
    "Reduction of quadratic form to canonical form by orthogonal transformation",
  ]),
  mkUnit(3, "Calculus", [
    "Rolle's theorem",
    "Lagrange's mean value theorem (geometrical interpretation)",
    "Cauchy's mean value theorem",
    "Taylor's & Maclaurin's theorems with remainders (without proof)",
    "Problems and applications of mean value theorems",
  ]),
  mkUnit(4, "Partial Differentiation & Applications (Multi-variable Calculus)", [
    "Functions of several variables — continuity & differentiability",
    "Partial derivatives, total derivatives, chain rule",
    "Directional derivative; Taylor's & Maclaurin's series for two variables",
    "Jacobians & functional dependence",
    "Maxima & minima of functions of two variables; Lagrange multipliers",
  ]),
  mkUnit(5, "Multiple Integrals (Multi-variable Calculus)", [
    "Double integrals & triple integrals",
    "Change of order of integration",
    "Change of variables to polar, cylindrical & spherical coordinates",
    "Areas using double integrals",
    "Volumes using double & triple integrals",
  ]),
], 3);

const R23_DEVC = mkSubject("MA201", "Differential Equations & Vector Calculus", [
  mkUnit(1, "Differential Equations of First Order and First Degree", [
    "Linear differential equations",
    "Bernoulli's equations",
    "Exact equations & equations reducible to exact form",
    "Applications: Newton's law of cooling",
    "Applications: law of natural growth & decay; electrical circuits",
  ]),
  mkUnit(2, "Linear Differential Equations of Higher Order (Constant Coefficients)", [
    "Definitions; homogeneous & non-homogeneous; complementary function",
    "General solution & particular integral; Wronskian",
    "Method of variation of parameters",
    "Simultaneous linear equations",
    "Applications: L-C-R circuit problems & simple harmonic motion",
  ]),
  mkUnit(3, "Partial Differential Equations", [
    "Formation of PDEs by elimination of arbitrary constants",
    "Formation of PDEs by elimination of arbitrary functions",
    "Solutions of first order linear equations — Lagrange's method",
    "Homogeneous linear PDEs with constant coefficients",
    "Standard problems",
  ]),
  mkUnit(4, "Vector Differentiation", [
    "Scalar and vector point functions",
    "Vector operator Del; gradient & directional derivative",
    "Divergence & Curl",
    "Vector identities",
    "Physical interpretations",
  ]),
  mkUnit(5, "Vector Integration", [
    "Line integral — circulation & work done",
    "Surface integral — flux",
    "Green's theorem in the plane (without proof)",
    "Stokes' theorem (without proof)",
    "Volume integral; Divergence theorem (without proof) & related problems",
  ]),
], 3);

const R23_EngineeringPhysics = mkSubject("PH101", "Engineering Physics", [
  mkUnit(1, "Wave Optics", [
    "Interference: principle of superposition; thin film interference",
    "Newton's rings — wavelength & refractive index determination",
    "Diffraction: Fresnel & Fraunhofer; single, double & N-slits",
    "Diffraction grating — dispersive & resolving power (qualitative)",
    "Polarization: by reflection, refraction, double refraction; Nicol's prism; half/quarter wave plates",
  ]),
  mkUnit(2, "Crystallography and X-ray Diffraction", [
    "Space lattice, basis, unit cell, lattice parameters",
    "Bravais lattices; crystal systems (3D)",
    "Coordination number & packing fraction of SC, BCC, FCC",
    "Miller indices; separation between (hkl) planes",
    "Bragg's law; X-ray diffractometer; Laue's & powder methods",
  ]),
  mkUnit(3, "Dielectric and Magnetic Materials", [
    "Dielectric polarization; polarizability, susceptibility, dielectric constant",
    "Types of polarization (electronic, ionic, orientation); Lorentz internal field; Clausius-Mossotti equation",
    "Frequency dependence of polarization; dielectric loss",
    "Magnetic dipole moment, magnetization, susceptibility & permeability",
    "Classification of magnetic materials; domain concept; hysteresis; soft & hard magnetic materials",
  ]),
  mkUnit(4, "Quantum Mechanics and Free Electron Theory", [
    "Dual nature of matter; Heisenberg's uncertainty principle",
    "Wave function — significance & properties",
    "Schrödinger's time-independent & time-dependent wave equations",
    "Particle in a one-dimensional infinite potential well",
    "Classical & quantum free electron theory; Fermi-Dirac distribution; density of states; Fermi energy",
  ]),
  mkUnit(5, "Semiconductors", [
    "Formation of energy bands; classification of crystalline solids",
    "Intrinsic semiconductors: density of charge carriers, conductivity, Fermi level",
    "Extrinsic semiconductors: density of charge carriers, dependence of Fermi energy",
    "Drift & diffusion currents; Einstein's equation",
    "Hall effect and its applications",
  ]),
], 3);

// Engineering Chemistry — for Civil, Chemical, Mechanical & allied (Group B mech-side)
const R23_EngineeringChemistry = mkSubject("CH101", "Engineering Chemistry", [
  mkUnit(1, "Water Technology", [
    "Soft & hard water; estimation of hardness by EDTA method",
    "Estimation of dissolved oxygen",
    "Boiler troubles: priming, foaming, scale & sludge, caustic embrittlement",
    "Industrial water treatment; BIS & WHO standards for drinking water",
    "Ion-exchange processes; desalination — reverse osmosis & electrodialysis",
  ]),
  mkUnit(2, "Electrochemistry and Applications", [
    "Electrodes, electrochemical cell, Nernst equation, cell potential",
    "Primary cells (Zinc-air); secondary cells (Ni-Cd, Li-ion)",
    "Fuel cells — hydrogen-oxygen fuel cell",
    "Corrosion theory; differential aeration & galvanic corrosion; Pilling-Bedworth ratio",
    "Cathodic & anodic protection; electroplating & electroless plating (Ni, Cu)",
  ]),
  mkUnit(3, "Polymers and Fuel Chemistry", [
    "Polymers: functionality, chain & step growth polymerization",
    "Thermoplastics & thermosetting plastics — polystyrene, PVC, Nylon-6,6, Bakelite",
    "Elastomers — Buna-S, Buna-N, Thiokol rubbers",
    "Fuels: types, calorific value, proximate & ultimate analysis of coal",
    "Liquid fuels: refining of petroleum, octane & cetane number; alternative fuels (propane, methanol, ethanol, biodiesel)",
  ]),
  mkUnit(4, "Modern Engineering Materials", [
    "Composites: constituents, particle/fibre/structural reinforced, applications",
    "Refractories: classification, properties, applications",
    "Lubricants: classification, mechanism, properties (viscosity, flash, fire, cloud points)",
    "Building materials: Portland cement constituents, setting & hardening",
    "Engineering applications & selection",
  ]),
  mkUnit(5, "Surface Chemistry and Nanomaterials", [
    "Colloids; nanometals & nanometal oxides; micelle formation",
    "Synthesis of colloids (Bragg's method)",
    "Chemical & biological methods of preparing nanometals/oxides",
    "Adsorption isotherms (Freundlich, Langmuir); BET equation",
    "Applications of colloids & nanomaterials — catalysis, medicine, sensors",
  ]),
], 3);

// Chemistry — for EEE, ECE, CSE, IT & allied
const R23_Chemistry = mkSubject("CH102", "Chemistry", [
  mkUnit(1, "Structure and Bonding Models", [
    "Fundamentals of quantum mechanics; Schrödinger wave equation",
    "Significance of Ψ and Ψ²; particle in a 1D box",
    "Molecular orbital theory — homo & heteronuclear diatomic molecules",
    "Energy level diagrams of O₂ and CO",
    "π-molecular orbitals of butadiene & benzene; bond order calculation",
  ]),
  mkUnit(2, "Modern Engineering Materials", [
    "Semiconductors — basic concepts & applications",
    "Superconductors — basic concepts & applications",
    "Supercapacitors — classification & applications",
    "Nanomaterials: classification, properties",
    "Fullerenes, carbon nanotubes & graphene nanoparticles",
  ]),
  mkUnit(3, "Electrochemistry and Applications", [
    "Electrochemical cell, Nernst equation, cell potential",
    "Potentiometry & potentiometric titrations (redox)",
    "Conductivity, conductivity cell, conductometric titrations",
    "Electrochemical sensors — potentiometric & amperometric",
    "Batteries — Zn-air, Li-ion; fuel cells (PEMFC)",
  ]),
  mkUnit(4, "Polymer Chemistry", [
    "Polymers — functionality, chain growth, step growth, coordination polymerization",
    "Plastics — PVC, Teflon, Bakelite, Nylon-6,6, carbon fibres",
    "Elastomers — Buna-S, Buna-N",
    "Conducting polymers — polyacetylene, polyaniline (mechanism)",
    "Bio-degradable polymers — PGA, PLA",
  ]),
  mkUnit(5, "Instrumental Methods and Applications", [
    "Electromagnetic spectrum; Beer-Lambert's law",
    "UV-Visible spectroscopy — electronic transitions, instrumentation",
    "IR spectroscopy — fundamental modes, selection rules, instrumentation",
    "Chromatography — basic principle & classification",
    "HPLC — principle, instrumentation, applications",
  ]),
], 3);

const R23_BasicCivilMech = mkSubject("CE101", "Basic Civil & Mechanical Engineering", [
  mkUnit(1, "Basics of Civil Engineering", [
    "Role of civil engineers in society; disciplines of civil engineering",
    "Structural, geotechnical, transportation, hydraulics & water resources, environmental engineering",
    "Building construction & planning",
    "Construction materials — cement, aggregate, bricks, cement concrete, steel",
    "Introduction to prefabricated construction techniques",
  ]),
  mkUnit(2, "Surveying", [
    "Objectives of surveying",
    "Horizontal measurements; angular measurements",
    "Introduction to bearings",
    "Levelling instruments; simple problems on levelling & bearings",
    "Contour mapping",
  ]),
  mkUnit(3, "Transportation Engineering", [
    "Importance of transportation in nation's economic development",
    "Types of highway pavements — flexible vs rigid (differences)",
    "Basics of harbour engineering",
    "Basics of tunnel & airport engineering",
    "Basics of railway engineering",
  ]),
  mkUnit(4, "Basics of Mechanical Engineering", [
    "Introduction to mechanical engineering disciplines",
    "Thermal engineering basics",
    "Manufacturing processes overview",
    "Power transmission elements",
    "IC engines — overview",
  ]),
  mkUnit(5, "Mechanical Engineering Applications", [
    "Refrigeration & air conditioning basics",
    "Renewable energy sources",
    "Robotics & automation overview",
    "Industry 4.0 introduction",
    "Case studies",
  ]),
], 3);

const R23_BasicEEE = mkSubject("EE101", "Basic Electrical & Electronics Engineering", [
  mkUnit(1, "DC Circuits", [
    "Ohm's law & Kirchhoff's laws (KCL, KVL)",
    "Series & parallel resistive circuits",
    "Mesh & nodal analysis",
    "Star-delta transformation",
    "Network theorems (Thevenin, Norton, Superposition)",
  ]),
  mkUnit(2, "AC Circuits", [
    "AC fundamentals — RMS, average, form & peak factor",
    "Single-phase RLC series & parallel circuits",
    "Phasor diagrams; power, power factor",
    "Resonance in series & parallel circuits",
    "Three-phase systems — star & delta connections",
  ]),
  mkUnit(3, "DC & AC Machines", [
    "DC generators — construction, EMF equation, types",
    "DC motors — types, characteristics, applications",
    "Single-phase & three-phase transformers — EMF equation, regulation, efficiency",
    "Three-phase induction motor — principle, types, applications",
    "Alternators — basics",
  ]),
  mkUnit(4, "Semiconductor Devices", [
    "PN junction diode — V-I characteristics",
    "Half-wave & full-wave rectifiers; filters",
    "Zener diode & voltage regulation",
    "BJT — construction, configurations, characteristics",
    "FET / MOSFET basics",
  ]),
  mkUnit(5, "Digital Electronics", [
    "Number systems & codes",
    "Boolean algebra & logic gates",
    "Combinational circuits — adders, multiplexers, decoders",
    "Sequential circuits — flip-flops, registers, counters",
    "Introduction to microprocessors",
  ]),
], 3);

const R23_IntroProgramming = mkSubject("CS101", "Introduction to Programming", [
  mkUnit(1, "Introduction to Programming & C Basics", [
    "Computer fundamentals; algorithm & flowchart",
    "Structure of a C program",
    "Data types, variables, constants; identifiers & keywords",
    "Operators & expressions; type conversion",
    "Input/output statements",
  ]),
  mkUnit(2, "Control Statements", [
    "Conditional statements — if, if-else, nested if, switch",
    "Iterative statements — for, while, do-while",
    "break, continue, goto",
    "Nested loops",
    "Sample programs",
  ]),
  mkUnit(3, "Arrays, Strings & Functions", [
    "1D and 2D arrays — declaration, initialization, operations",
    "Strings & string handling functions",
    "Functions — definition, declaration, calling",
    "Parameter passing — call by value & call by reference",
    "Recursion; storage classes; scope & lifetime",
  ]),
  mkUnit(4, "Pointers & Structures", [
    "Pointer basics — declaration, initialization",
    "Pointers & arrays; pointer arithmetic",
    "Dynamic memory allocation (malloc, calloc, realloc, free)",
    "Structures — declaration, nested structures, array of structures",
    "Unions; enumerations",
  ]),
  mkUnit(5, "File Handling & Preprocessor", [
    "File handling — opening, closing, reading, writing",
    "Sequential vs random access files",
    "Command line arguments",
    "Preprocessor directives — #include, #define, macros",
    "Conditional compilation; sample applications",
  ]),
], 3);

const R23_EngineeringGraphics = mkSubject("ME102", "Engineering Graphics", [
  mkUnit(1, "Introduction & Engineering Curves", [
    "Drawing instruments & their uses",
    "Lettering, dimensioning, lines & scales",
    "Conic sections — ellipse, parabola, hyperbola (general methods)",
    "Cycloidal curves — cycloid, epicycloid, hypocycloid",
    "Involute of a circle",
  ]),
  mkUnit(2, "Orthographic Projections", [
    "Principles of orthographic projection; first & third angle",
    "Projection of points in different quadrants",
    "Projection of straight lines — parallel, perpendicular, inclined to one/both planes",
    "Traces of lines",
    "True length & true inclination",
  ]),
  mkUnit(3, "Projections of Planes & Solids", [
    "Projection of planes — perpendicular & inclined to one/both planes",
    "Projection of regular solids (prism, pyramid, cylinder, cone) in simple positions",
    "Projection of solids with axis inclined to one plane",
    "Projection of solids with axis inclined to both planes",
    "Auxiliary projections (introduction)",
  ]),
  mkUnit(4, "Sections & Development of Surfaces", [
    "Section of solids — sectional views, true shape of section",
    "Cutting plane perpendicular to one plane and inclined to another",
    "Development of surfaces — prisms & cylinders",
    "Development of pyramids & cones",
    "Development of truncated solids",
  ]),
  mkUnit(5, "Isometric & Orthographic Conversions", [
    "Isometric projection — principles & isometric scale",
    "Isometric views of planes & simple solids",
    "Conversion of isometric views into orthographic views",
    "Conversion of orthographic views into isometric views",
    "Introduction to computer-aided drafting (AutoCAD)",
  ]),
], 3);

const R23_DataStructures = mkSubject("CS202", "Data Structures", [
  mkUnit(1, "Introduction to Data Structures", [
    "Significance of data structures; classification",
    "Time & space complexity; asymptotic notations (Big-O, Ω, Θ)",
    "Arrays — operations, applications",
    "Searching — linear & binary search",
    "Sorting — bubble, selection, insertion sort",
  ]),
  mkUnit(2, "Linked Lists", [
    "Singly linked list — creation, insertion, deletion, traversal",
    "Doubly linked list — operations",
    "Circular linked list — operations",
    "Applications of linked lists",
    "Polynomial representation & arithmetic",
  ]),
  mkUnit(3, "Stacks and Queues", [
    "Stack ADT — array & linked list implementation",
    "Applications — infix to postfix, expression evaluation, parentheses matching",
    "Queue ADT — array & linked list implementation",
    "Circular queue, double-ended queue (deque)",
    "Priority queue",
  ]),
  mkUnit(4, "Trees", [
    "Tree terminology; binary trees & their representation",
    "Tree traversals — inorder, preorder, postorder, level order",
    "Binary search tree — operations",
    "AVL trees; B-trees (introduction)",
    "Heap; heap sort",
  ]),
  mkUnit(5, "Graphs & Hashing", [
    "Graph representations — adjacency matrix & list",
    "Graph traversals — BFS & DFS",
    "Shortest path — Dijkstra's algorithm",
    "Minimum spanning tree — Prim's & Kruskal's algorithms",
    "Hashing — hash functions, collision resolution techniques",
  ]),
], 3);

const R23_EngMechanics = mkSubject("ME203", "Engineering Mechanics", [
  mkUnit(1, "System of Forces", [
    "Introduction to engineering mechanics; system of forces",
    "Resultant of coplanar concurrent forces",
    "Resolution of forces; equilibrium of concurrent force systems",
    "Moment of a force; Varignon's theorem",
    "Couples; equilibrium of non-concurrent force systems",
  ]),
  mkUnit(2, "Friction & Centroid", [
    "Friction — laws, types, angle of friction & repose",
    "Wedge & ladder friction; belt friction",
    "Centroid of plane figures — composite areas",
    "Centroid by integration",
    "Centre of gravity of solids",
  ]),
  mkUnit(3, "Moment of Inertia", [
    "Area moment of inertia — definition",
    "Parallel & perpendicular axis theorems",
    "Moment of inertia of standard sections",
    "Mass moment of inertia of solids",
    "Polar moment of inertia",
  ]),
  mkUnit(4, "Kinematics of Particles", [
    "Rectilinear motion — uniform & uniformly accelerated motion",
    "Curvilinear motion — projectile motion",
    "Normal & tangential components",
    "Relative motion",
    "Kinematics of rigid bodies — translation & rotation",
  ]),
  mkUnit(5, "Kinetics & Work-Energy", [
    "Newton's second law — equations of motion",
    "D'Alembert's principle",
    "Work-energy principle for particles & rigid bodies",
    "Impulse-momentum principle",
    "Collision of elastic bodies",
  ]),
], 3);

const R23_NetworkAnalysis = mkSubject("EC202", "Network Analysis", [
  mkUnit(1, "Network Elements & Laws", [
    "Network elements — R, L, C; sources (independent & dependent)",
    "Source transformations",
    "Kirchhoff's laws (KCL, KVL); mesh & nodal analysis",
    "Star-delta & delta-star transformation",
    "Network topology — graph, tree, cut-set, tie-set",
  ]),
  mkUnit(2, "Network Theorems", [
    "Superposition theorem",
    "Thevenin's & Norton's theorems",
    "Maximum power transfer theorem",
    "Reciprocity & Millman's theorems",
    "Compensation theorem",
  ]),
  mkUnit(3, "Transient & Steady-State Analysis", [
    "Transient response of RL, RC, RLC circuits — DC excitation",
    "Initial conditions",
    "Sinusoidal steady-state analysis",
    "Phasor representation; impedance & admittance",
    "Power in AC circuits — real, reactive, apparent",
  ]),
  mkUnit(4, "Resonance & Coupled Circuits", [
    "Series & parallel resonance",
    "Q-factor, bandwidth, selectivity",
    "Coupled circuits — self & mutual inductance",
    "Coefficient of coupling; dot convention",
    "Analysis of coupled circuits",
  ]),
  mkUnit(5, "Two-Port Networks & Three-Phase", [
    "Two-port network parameters — Z, Y, h, ABCD",
    "Inter-relationships of parameters",
    "Three-phase circuits — balanced & unbalanced loads",
    "Star & delta connections; line & phase quantities",
    "Power measurement in three-phase circuits",
  ]),
], 3);

// ----- Group A: Y1S1 (Chemistry + Programming first) -----
// CSE, EEE, Chemical, Food Tech, Petroleum, Pharmaceutical
const R23_GroupA_Y1S1: Subject[] = [
  R23_CommunicativeEnglish,
  R23_Chemistry, // Note: EEE/CSE use "Chemistry"; allied branches may use Eng. Chemistry/Fundamental
  R23_LinearAlgebraCalculus,
  R23_BasicCivilMech,
  R23_IntroProgramming,
];

// ----- Group A: Y1S2 (Physics + Engg Graphics + branch-specific PC) -----
const R23_GroupA_Y1S2 = (branchPC: Subject): Subject[] => [
  R23_EngineeringPhysics,
  R23_DEVC,
  R23_BasicEEE,
  R23_EngineeringGraphics,
  branchPC, // Data Structures (CSE) / Electrical Circuit Analysis-I (EEE)
];

// ----- Group B: Y1S1 (Physics + Maths-I first) -----
// Civil, Mech, Mining, Auto, Robotics, ECE & allied, IT/AIDS/AIML/DS, Agriculture
const R23_GroupB_Y1S1: Subject[] = [
  R23_EngineeringPhysics,
  R23_LinearAlgebraCalculus,
  R23_BasicEEE,
  R23_EngineeringGraphics,
  R23_IntroProgramming,
];

// ----- Group B: Y1S2 (Chemistry + Maths-II + branch-specific PC) -----
const R23_GroupB_Y1S2 = (branchPC: Subject): Subject[] => [
  R23_CommunicativeEnglish,
  R23_EngineeringChemistry, // Civil/Mech use Eng. Chemistry; CSE-allied/ECE use "Chemistry" — keeping Eng. Chemistry as default
  R23_DEVC,
  R23_BasicCivilMech,
  branchPC, // Engineering Mechanics / Network Analysis / Data Structures
];

// Branch-specific Year 1 builders (Group A or B + correct PC subject in 1-2)
const R23_Year1_GroupA = (branchPC_1_2: Subject): Year => ({
  number: 1,
  label: "1st Year",
  semesters: [
    { number: 1, subjects: R23_GroupA_Y1S1 },
    { number: 2, subjects: R23_GroupA_Y1S2(branchPC_1_2) },
  ],
});

const R23_Year1_GroupB = (branchPC_1_2: Subject): Year => ({
  number: 1,
  label: "1st Year",
  semesters: [
    { number: 1, subjects: R23_GroupB_Y1S1 },
    { number: 2, subjects: R23_GroupB_Y1S2(branchPC_1_2) },
  ],
});

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
