
import { User, Role, Course, Progress, Query } from './types';
import { TRADITIONAL_USER_AVATAR } from './constants';

// Helper function to format names to Title Case
const toTitleCase = (str: string) => {
  return str.toLowerCase().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const createUsername = (name: string) => {
    return name.toLowerCase().replace(/ \(.+\)/, '').replace(/ /g, '.');
}

const instructorList = [
    "Tony Stark", "Natasha Romanoff", "Peter Parker", "Pepper Potts", "Vision", 
    "Shuri", "Bruce Banner", "Wanda Maximoff", "Stephen Strange", "Rocket Raccoon", 
    "Steve Rogers", "Bucky Barnes", "Sam Wilson", "Clint Barton", "Okoye", 
    "Nick Fury", "Maria Hill", "Scott Lang", "Hope van Dyne", "Carol Danvers", 
    "James Rhodes", "Kate Bishop", "Wong", "T’Challa", "Erik Killmonger", 
    "Happy Hogan", "Ned Leeds", "Gamora", "Nebula", "Groot", "Mantis", "Loki", 
    "Sylvie", "Reed Richards", "Sue Storm", "Thor Odinson", "Valkyrie", "Heimdall", 
    "Korg", "Yondu", "Star-Lord (Peter Quill)", "Jane Foster", "Hank Pym", 
    "Cassie Lang", "Kamala Khan", "Charles Xavier", "Magneto", "Jean Grey", 
    "Scott Summers (Cyclops)", "Beast", "Storm", "Tony Stark (Young)", 
    "Rhodey (Young)", "Pietro Maximoff", "Vision (Young)", "Sersi", "Ikaris", 
    "Peggy Carter", "Isaiah Bradley", "Ultron", "Jarvis", "War Machine", 
    "Ironheart (Riri Williams)", "The Ancient One", "Agatha Harkness", "Deadpool", 
    "Domino", "Kingo", "Phastos", "MJ (Michelle Jones)", "Gwen Stacy", 
    "Girijesh", "Howard Stark", "Peter Parker (Miles Morales)", "Ned Leeds (Alt)", 
    "Spider-Gwen", "Daredevil"
];

const uniqueInstructorNames = [...new Set(instructorList)];

const newInstructors: User[] = uniqueInstructorNames.map((name, index) => ({
    id: index + 1,
    name: `${name} (Instructor)`,
    username: createUsername(name),
    password: 'password',
    role: Role.Instructor,
    enrolledCourseIds: [],
    profilePicture: TRADITIONAL_USER_AVATAR
}));

const instructorNameToIdMap = new Map(newInstructors.map(i => [i.name.replace(' (Instructor)', ''), i.id]));

const getInstructorId = (name: string): number => {
    const cleanName = name.replace(' (Young)', '').replace(' (Alt)', '').replace(' (Peter Quill)', '').replace(' (Miles Morales)', '').replace(' (Michelle Jones)', '').replace(' (Riri Williams)', '').replace(' (Cyclops)', '');
    return instructorNameToIdMap.get(cleanName.replace('Hawkeye (', '').replace(')', '')) || 0;
};

// Base list of students/admins without profile pictures initially
const rawStudentsAndAdmins = [
  // Admin
  { id: 97, name: 'Divya Bharathi (Admin)', username: 'DB', password: 'password', role: Role.Admin, enrolledCourseIds: [] },
  { id: 98, name: 'HH (Admin)', username: 'hh', password: 'password', role: Role.Admin, enrolledCourseIds: [] },
  { id: 99, name: 'Grish (Admin)', username: 'grish', password: 'password', role: Role.Admin, enrolledCourseIds: [] },
  { id: 100, name: 'GD (Admin)', username: 'gd', password: 'password', role: Role.Admin, enrolledCourseIds: [] },

  // Students
  { id: 103, name: `${toTitleCase('AARON MICHAEL RAJ')} (Student)`, username: 'aaron.michael.raj', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 104, name: `${toTitleCase('ABDUL RAZEEK A')} (Student)`, username: 'abdul.razeek.a', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 105, name: `${toTitleCase('AKASH N')} (Student)`, username: 'akash.n', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 106, name: `${toTitleCase('AKASH R')} (Student)`, username: 'akash.r', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 107, name: `${toTitleCase('ARAVINDAN K')} (Student)`, username: 'aravindan.k', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 108, name: `${toTitleCase('ARJUN S N')} (Student)`, username: 'arjun.s.n', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 109, name: `${toTitleCase('AROCKIA JERISH RAJ M')} (Student)`, username: 'arockia.jerish.raj.m', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 110, name: `${toTitleCase('BHARANIDHARAN K')} (Student)`, username: 'bharanidharan.k', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 111, name: `${toTitleCase('BHARATH B')} (Student)`, username: 'bharath.b', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 112, name: `${toTitleCase('BHARATHWAJ T G')} (Student)`, username: 'bharathwaj.t.g', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 113, name: `${toTitleCase('DEVICHARAN P')} (Student)`, username: 'devicharan.p', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 114, name: `${toTitleCase('DHANAKIRAN G')} (Student)`, username: 'dhanakiran.g', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 115, name: `${toTitleCase('DHANASRIDHARAN A')} (Student)`, username: 'dhanasridharan.a', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 116, name: `${toTitleCase('DINESH KUMAR K')} (Student)`, username: 'dinesh.kumar.k', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 117, name: `${toTitleCase('ELUMALAI S')} (Student)`, username: 'elumalai.s', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 118, name: `${toTitleCase('FAZIL AHAMED H R')} (Student)`, username: 'fazil.ahamed.h.r', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 119, name: `${toTitleCase('GANGASH S')} (Student)`, username: 'gangash.s', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 120, name: `${toTitleCase('ABINAYA A')} (Student)`, username: 'abinaya.a', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 121, name: `${toTitleCase('AFIYA J')} (Student)`, username: 'afiya.j', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 122, name: `${toTitleCase('AGALYA K')} (Student)`, username: 'agalya.k', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 123, name: `${toTitleCase('ARCHANA J')} (Student)`, username: 'archana.j', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 124, name: `${toTitleCase('ARULMOZHI PRABA R')} (Student)`, username: 'arulmozhi.praba.r', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 125, name: `${toTitleCase('ARUNA SHIVANI A S')} (Student)`, username: 'aruna.shivani.a.s', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 126, name: `${toTitleCase('ASHMA BANU M')} (Student)`, username: 'ashma.banu.m', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 127, name: `${toTitleCase('HARITHA K')} (Student)`, username: 'haritha.k', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 128, name: `${toTitleCase('HARIVARSHINI G')} (Student)`, username: 'harivarshini.g', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 129, name: `${toTitleCase('HARSHAVARDHINI P')} (Student)`, username: 'harshavardhini.p', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 130, name: `${toTitleCase('HARSHINI K')} (Student)`, username: 'harshini.k', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 131, name: `${toTitleCase('HARSHITHA R')} (Student)`, username: 'harshitha.r', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 132, name: `${toTitleCase('FAVANTHIKA K P')} (Student)`, username: 'favanthika.k.p', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 133, name: `${toTitleCase('BHAVADHARANI A')} (Student)`, username: 'bhavadharani.a', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 134, name: `${toTitleCase('BHAWNA SRI B')} (Student)`, username: 'bhawna.sri.b', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 135, name: `${toTitleCase('CROSINI INFANTEENA R')} (Student)`, username: 'crosini.infanteena.r', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 136, name: `${toTitleCase('DEEPIKA S')} (Student)`, username: 'deepika.s', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 137, name: `${toTitleCase('DEVIPRIYA P')} (Student)`, username: 'devipriya.p', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 138, name: `${toTitleCase('DHARANI D V')} (Student)`, username: 'dharani.d.v', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 139, name: `${toTitleCase('DHARANI MARI I M')} (Student)`, username: 'dharani.mari.i.m', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 140, name: `${toTitleCase('DHARSHINI S')} (Student)`, username: 'dharshini.s', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 141, name: `${toTitleCase('DHIVYADHARSHINI J')} (Student)`, username: 'dhivyadharshini.j', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 142, name: `${toTitleCase('DIKSHA S')} (Student)`, username: 'diksha.s', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 143, name: `${toTitleCase('DIVYA DHARSHINI M')} (Student)`, username: 'divya.dharshini.m', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 144, name: `${toTitleCase('DIVYA P')} (Student)`, username: 'divya.p', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 145, name: `${toTitleCase('DURGA R')} (Student)`, username: 'durga.r', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 146, name: `${toTitleCase('ELAIYANILA S')} (Student)`, username: 'elaiyanila.s', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 147, name: `${toTitleCase('ELAKHYA K')} (Student)`, username: 'elakhya.k', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 148, name: `${toTitleCase('ENIYAA A')} (Student)`, username: 'eniyaa.a', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 149, name: `${toTitleCase('ESTHER JULIET S')} (Student)`, username: 'esther.juliet.s', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 150, name: `${toTitleCase('GANAGHASHREE K')} (Student)`, username: 'ganaghashree.k', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 151, name: `${toTitleCase('GAYATHRI M')} (Student)`, username: 'gayathri.m', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 152, name: `${toTitleCase('HARI PRIYA E')} (Student)`, username: 'hari.priya.e', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 153, name: `${toTitleCase('HARINI M')} (Student)`, username: 'harini.m', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 154, name: `${toTitleCase('HARINI R')} (Student)`, username: 'harini.r', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 155, name: `${toTitleCase('HARINI S')} (Student)`, username: 'harini.s', password: 'password', role: Role.Student, enrolledCourseIds: [] },
  { id: 156, name: `${toTitleCase('HARIPRIYA S')} (Student)`, username: 'haripriya.s', password: 'password', role: Role.Student, enrolledCourseIds: [] },
];

// Map raw data to User objects with profile pictures
const oldStudentsAndAdmin: User[] = rawStudentsAndAdmins.map(user => ({
  ...user,
  profilePicture: TRADITIONAL_USER_AVATAR
}));

export const INITIAL_USERS: User[] = [...newInstructors, ...oldStudentsAndAdmin];

const courseIntroductions: Record<string, string> = {
    "Agile Development Methodology": "Focuses on iterative software development using Scrum and Kanban.\nTeaches adaptability, sprint planning, and cross-functional teamwork.\nStudents learn Agile documentation, velocity tracking, and retrospectives.\nTony drives innovation; Natasha ensures discipline and precision.\nPrepares learners for real-world Agile project environments.",
    "Agile Development Methodology Laboratory (Design Thinking)": "Hands-on implementation of Agile through design thinking phases.\nCovers empathizing, ideation, prototyping, and testing user solutions.\nPeter promotes creativity, Pepper ensures business alignment.\nTeams develop functional prototypes within sprint cycles.\nStrengthens innovation and teamwork through iterative improvement.",
    "AI Engineering Fundamentals with Azure": "Introduces AI workflow automation using Microsoft Azure tools.\nCovers data preprocessing, model training, and cloud deployment.\nVision explains intelligence logic; Shuri handles implementation.\nFocuses on scalable, ethical AI design in real-world applications.\nPrepares students to build enterprise-ready AI solutions.",
    "Artificial Intelligence and Machine Learning": "Explores algorithms enabling computers to learn and reason.\nCovers supervised, unsupervised, and reinforcement learning models.\nBruce explains logic; Wanda visualizes the unseen data magic.\nStudents build and analyze predictive models using Python.\nBuilds foundation for modern intelligent systems and analytics.",
    "Artificial Intelligence and Machine Learning Laboratory": "Applies machine learning models in real-time coding environments.\nCovers data cleaning, visualization, and model evaluation techniques.\nDr. Strange mentors conceptual depth; Rocket ensures code accuracy.\nEncourages experimentation using Scikit-learn and TensorFlow.\nDevelops AI prototyping and optimization confidence.",
    "Basics of Engineering": "Introduces multi-disciplinary engineering fundamentals.\nCovers mechanics, materials, and design principles.\nSteve teaches ethics; Bucky enforces analytical precision.\nPrepares students for advanced engineering problem-solving.\nBuilds teamwork, accuracy, and logical reasoning foundation.",
    "Basics of Engineering Laboratory": "Applies theoretical engineering knowledge through experiments.\nCovers mechanical, civil, and electrical practice sessions.\nSam encourages teamwork; Clint ensures measurement precision.\nEnhances understanding of instruments and data interpretation.\nBuilds practical skill for real-world applications.",
    "Basic Japanese": "Teaches basic Japanese grammar, vocabulary, and writing systems.\nFocuses on Hiragana, Katakana, and simple Kanji usage.\nHawkeye sharpens pronunciation; Okoye emphasizes discipline.\nEncourages conversational confidence through dialogues.\nPromotes cultural appreciation and global communication.",
    "Business Communication": "Builds effective professional communication and leadership tone.\nCovers business writing, presentation, and email etiquette.\nNick emphasizes assertiveness; Hill focuses on clarity.\nStudents practice public speaking and group discussions.\nEnhances confidence for corporate interactions.",
    "Career Skill Development I": "Introduces professional behavior and workplace readiness.\nFocuses on resume writing, goal setting, and interviews.\nScott promotes adaptability; Hope trains logical confidence.\nEncourages self-assessment and teamwork practice.\nDevelops core employability and personal growth skills.",
    "Career Skill Development II": "Strengthens interpersonal and decision-making skills.\nCovers workplace communication and corporate ethics.\nCarol promotes leadership; Rhodes enforces strategy.\nFocuses on team dynamics and emotional intelligence.\nPrepares students for professional collaboration.",
    "Career Skill Development III": "Enhances advanced communication and analytical reasoning.\nCovers leadership presentation and mock-interview techniques.\nKate focuses on clarity; Wong ensures mindfulness.\nSimulates real-world work scenarios and roleplays.\nPolishes personality for professional excellence.",
    "Computer Architecture and Organization": "Explains how computers process, store, and execute data.\nCovers CPU design, memory hierarchy, and instruction cycles.\nT’Challa teaches structure; Erik challenges optimization.\nFocuses on assembly-level understanding of hardware.\nForms the base for embedded and system programming.",
    "C Programming": "Teaches structured programming using C language fundamentals.\nCovers syntax, functions, arrays, and pointers.\nHappy ensures discipline; Ned simplifies debugging.\nFocuses on logic building and algorithmic efficiency.\nFoundation for advanced software development.",
    "Data Science": "Introduces data processing, analysis, and visualization concepts.\nCovers statistics, Python tools, and data cleaning.\nGamora ensures precision; Nebula ensures automation.\nStudents explore patterns and insights through datasets.\nPrepares learners for analytical and AI roles.",
    "Data Science Laboratory": "Hands-on experience in data analytics and visualization.\nCovers Pandas, Matplotlib, and NumPy practice sessions.\nGroot guides fundamentals; Mantis ensures interpretation clarity.\nStudents analyze real-world datasets.\nBuilds applied skills for AI and analytics.",
    "Data Structures": "Focuses on organizing data efficiently using algorithms.\nCovers stacks, queues, trees, and linked lists.\nLoki introduces logic; Sylvie tests manipulation.\nImproves memory usage and execution efficiency.\nFoundation for software and system logic design.",
    "Database Management Systems": "Covers database creation, normalization, and SQL queries.\nTeaches relational models and data integrity principles.\nReed ensures precision; Sue simplifies design flow.\nStudents learn CRUD operations and transaction control.\nCore for backend and application development.",
    "Design and Analysis of Algorithms": "Focuses on algorithm efficiency and time complexity.\nCovers recursion, sorting, and greedy strategies.\nThor promotes strength in logic; Valkyrie ensures balance.\nStudents analyze space-time tradeoffs.\nFoundation for competitive coding and optimization.",
    "Design and Analysis of Algorithms Laboratory": "Applies algorithmic design concepts via coding sessions.\nCovers sorting, searching, and graph-based programs.\nHeimdall ensures precision; Korg simplifies logic.\nFocuses on runtime and correctness testing.\nDevelops efficient coding implementation habits.",
    "Digital Principles and System Design": "Covers fundamentals of digital logic and circuit design.\nIncludes Boolean algebra, flip-flops, and counters.\nYondu ensures discipline; Star-Lord adds creativity.\nStudents design digital systems using logic gates.\nPrepares for microprocessor and hardware courses.",
    "Engineering Chemistry": "Explores molecular structure and chemical bonding principles.\nCovers polymers, corrosion, and electrochemistry.\nJane explains theory; Hank relates real applications.\nPromotes eco-friendly material science understanding.\nFoundation for environmental and industrial chemistry.",
    "Engineering Chemistry Laboratory": "Focuses on performing experiments and recording reactions.\nCovers titration, calorimetry, and water analysis.\nCassie adds enthusiasm; Kamala ensures accuracy.\nStudents learn safety and analytical precision.\nBuilds observation and reporting skills.",
    "Engineering Mathematics I": "Covers calculus, differential equations, and matrix algebra.\nCharles promotes logic; Magneto challenges problem-solving.\nFocuses on engineering problem applications.\nDevelops analytical and numerical reasoning skills.\nFoundation for all technical computations.",
    "Engineering Mathematics II": "Explores vector calculus, complex numbers, and Laplace transforms.\nJean explains theory; Cyclops maintains focus.\nEmphasizes problem-solving and accuracy.\nSupports advanced subjects like physics and networks.\nStrengthens mathematical modeling and logic.",
    "Engineering Mathematics III": "Covers probability, statistics, and numerical methods.\nBeast ensures precision; Storm adds visualization.\nFocuses on random variables and correlation.\nApplies math in data and signal processing.\nEssential for analytics and machine learning.",
    "Engineering Physics": "Introduces laws of motion, optics, and thermodynamics.\nTony emphasizes application; Rhodey ensures discipline.\nTeaches wave mechanics and electromagnetic theory.\nApplies physics in engineering problem contexts.\nCore for mechanical and electrical systems understanding.",
    "Engineering Physics Laboratory": "Applies physics concepts through real experiments.\nCovers optics, mechanics, and electricity.\nPietro ensures speed; Vision ensures accuracy.\nEncourages precision and data-based reasoning.\nStrengthens theoretical understanding practically.",
    "Heritage of Tamils": "Explores Tamil civilization, language, and contributions.\nSersi emphasizes culture; Ikaris ensures history depth.\nFocuses on literature, art, and science evolution.\nEncourages appreciation of regional heritage.\nInstills respect for identity and legacy.",
    "Indian Constitution": "Covers structure and values of Indian democracy.\nTeaches rights, duties, and federal framework.\nPeggy ensures discipline; Isaiah emphasizes justice.\nHighlights importance of equality and freedom.\nPromotes civic responsibility and awareness.",
    "Operating Systems": "Teaches process management and memory allocation concepts.\nCovers scheduling, deadlocks, and file systems.\nUltron ensures control; Jarvis ensures balance.\nFocuses on OS design and multitasking logic.\nFoundation for software system development.",
    "Operating Systems Laboratory": "Implements OS concepts via practical coding.\nCovers process simulation and shell scripting.\nWar Machine ensures strength; Ironheart brings precision.\nEncourages debugging and resource management.\nLinks theory with real-time OS execution.",
    "Probability and Statistics": "Covers probability theory, distributions, and hypothesis testing.\nAncient One provides clarity; Agatha adds logic depth.\nFocuses on real-world data analysis.\nEnables statistical modeling and prediction.\nFoundation for analytics and AI learning.",
    "Python Programming": "Teaches versatile programming using Python language.\nCovers data types, control flow, and OOP.\nDeadpool keeps it fun; Domino keeps it efficient.\nFocuses on automation and data handling.\nIdeal for AI, ML, and web projects.",
    "Tamils and Technology": "Explores Tamil innovations in science and engineering.\nKingo promotes art; Phastos connects ancient technology.\nLinks heritage with modern inventions.\nEncourages interdisciplinary understanding.\nPromotes cultural-tech awareness.",
    "Technical English": "Improves English for technical writing and presentations.\nMJ ensures creativity; Gwen ensures grammar.\nCovers reports, documentation, and oral communication.\nEnhances academic and professional fluency.\nBuilds global communication competence.",
    "Universal Human Values": "Focuses on ethics, empathy, and life values.\nAunt May teaches compassion; Howard adds realism.\nEncourages responsible behavior and social balance.\nCovers emotional intelligence and human dignity.\nPromotes value-based leadership.",
    "Web Application Development": "Covers HTML, CSS, JavaScript, and responsive design.\nMiles ensures creativity; Ned handles structure.\nStudents build dynamic web pages and APIs.\nEmphasizes UI/UX and functionality balance.\nFoundation for full-stack web development.",
    "Web Application Development Laboratory": "Practical creation of web apps and front-end prototypes.\nCovers interactive forms, routing, and deployment.\nSpider-Gwen ensures design; Daredevil ensures debugging.\nStudents host real-time applications.\nEnhances applied web engineering skills."
};

const courseData = [
  { title: "Agile Development Methodology", instructors: ["Tony Stark", "Natasha Romanoff"] },
  { title: "Agile Development Methodology Laboratory (Design Thinking)", instructors: ["Peter Parker", "Pepper Potts"] },
  { title: "AI Engineering Fundamentals with Azure", instructors: ["Vision", "Shuri"] },
  { title: "Artificial Intelligence and Machine Learning", instructors: ["Bruce Banner", "Wanda Maximoff"] },
  { title: "Artificial Intelligence and Machine Learning Laboratory", instructors: ["Stephen Strange", "Rocket Raccoon"] },
  { title: "Basics of Engineering", instructors: ["Steve Rogers", "Bucky Barnes"] },
  { title: "Basics of Engineering Laboratory", instructors: ["Sam Wilson", "Clint Barton"] },
  { title: "Basic Japanese", instructors: ["Hawkeye (Clint Barton)", "Okoye"] },
  { title: "Business Communication", instructors: ["Nick Fury", "Maria Hill"] },
  { title: "Career Skill Development I", instructors: ["Scott Lang", "Hope van Dyne"] },
  { title: "Career Skill Development II", instructors: ["Carol Danvers", "James Rhodes"] },
  { title: "Career Skill Development III", instructors: ["Kate Bishop", "Wong"] },
  { title: "Computer Architecture and Organization", instructors: ["T’Challa", "Erik Killmonger"] },
  { title: "C Programming", instructors: ["Happy Hogan", "Ned Leeds"] },
  { title: "Data Science", instructors: ["Gamora", "Nebula"] },
  { title: "Data Science Laboratory", instructors: ["Groot", "Mantis"] },
  { title: "Data Structures", instructors: ["Loki", "Sylvie"] },
  { title: "Database Management Systems", instructors: ["Reed Richards", "Sue Storm"] },
  { title: "Design and Analysis of Algorithms", instructors: ["Thor Odinson", "Valkyrie"] },
  { title: "Design and Analysis of Algorithms Laboratory", instructors: ["Heimdall", "Korg"] },
  { title: "Digital Principles and System Design", instructors: ["Yondu", "Star-Lord (Peter Quill)"] },
  { title: "Engineering Chemistry", instructors: ["Jane Foster", "Hank Pym"] },
  { title: "Engineering Chemistry Laboratory", instructors: ["Cassie Lang", "Kamala Khan"] },
  { title: "Engineering Mathematics I", instructors: ["Charles Xavier", "Magneto"] },
  { title: "Engineering Mathematics II", instructors: ["Jean Grey", "Scott Summers (Cyclops)"] },
  { title: "Engineering Mathematics III", instructors: ["Beast", "Storm"] },
  { title: "Engineering Physics", instructors: ["Tony Stark (Young)", "Rhodey (Young)"] },
  { title: "Engineering Physics Laboratory", instructors: ["Pietro Maximoff", "Vision (Young)"] },
  { title: "Heritage of Tamils", instructors: ["Sersi", "Ikaris"] },
  { title: "Indian Constitution", instructors: ["Peggy Carter", "Isaiah Bradley"] },
  { title: "Operating Systems", instructors: ["Ultron", "Jarvis"] },
  { title: "Operating Systems Laboratory", instructors: ["War Machine", "Ironheart (Riri Williams)"] },
  { title: "Probability and Statistics", instructors: ["The Ancient One", "Agatha Harkness"] },
  { title: "Python Programming", instructors: ["Deadpool", "Domino"] },
  { title: "Tamils and Technology", instructors: ["Kingo", "Phastos"] },
  { title: "Technical English", instructors: ["MJ (Michelle Jones)", "Gwen Stacy"] },
  { title: "Universal Human Values", instructors: ["Girijesh", "Howard Stark"] },
  { title: "Web Application Development", instructors: ["Peter Parker (Miles Morales)", "Ned Leeds (Alt)"] },
  { title: "Web Application Development Laboratory", instructors: ["Spider-Gwen", "Daredevil"] },
  { title: "HMS – Tony Stark", instructors: ["Tony Stark"] }
];

export const INITIAL_COURSES: Course[] = courseData.map((course, index) => {
    const introText = courseIntroductions[course.title] || `An in-depth look at ${course.title}, taught by experts in the field.`;
    
    // Map all instructor names to their IDs
    const instructorIds = course.instructors.map(name => getInstructorId(name)).filter(id => id !== 0);

    return {
        id: index + 1,
        title: course.title,
        description: introText,
        instructorIds: instructorIds, // Assign array of IDs
        // Course Image now reflects the Course Name using an Avatar Generator
        imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&background=random&size=512&font-size=0.33&bold=true&color=fff`,
        lessons: [
            { id: (index * 10) + 1, title: `Introduction to ${course.title}`, type: 'text', content: introText },
            { id: (index * 10) + 2, title: 'Core Concepts', type: 'text', content: 'This lesson covers the fundamental principles and core concepts. Understanding these basics is crucial for mastering the subject.' },
            { id: (index * 10) + 3, title: 'Advanced Topics', type: 'text', content: 'Here we dive into more complex and advanced topics, building upon the foundational knowledge from previous lessons.' },
            { id: (index * 10) + 4, title: 'Practical Applications', type: 'text', content: 'This section focuses on real-world applications and case studies.' },
        ],
        reviews: []
    }
});

export const INITIAL_PROGRESS: Progress[] = [];

export const INITIAL_QUERIES: Query[] = [];
