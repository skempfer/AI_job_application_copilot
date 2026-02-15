import { extractYearsExperience } from "./src/preprocessing/extractYearsExperience.js";
import { normalizeText } from "./src/preprocessing/normalizeText.js";
import { detectDomainExperience } from "./src/preprocessing/detectDomainExperience.js";

const testCVs = [
  "JavaScript Developer with 5 years of experience in React",

  "Backend Engineer (2019 - Present) at TechCorp",

  "Frontend Developer 2020 - 2023",

  "Software Engineer since 2018",

  "Junior Developer - Entry level",
  `
    Senior Full Stack Developer
    React Expert | 8+ years experience
    Portfolio: github.com/example
    Experience:
    - Tech Lead at BigCorp (2016 - Present)
    - Senior Dev at StartupXYZ (2018-2020)
    - Junior Dev (2015-2018)
  `,

  "Front-end developer with back-end experience, 6 years",

  "10+ years as JavaScript developer",
];

testCVs.forEach((cv, index) => {
  const result = extractYearsExperience(cv);

  const domains = detectDomainExperience(cv);
  const detectedDomains = Object.entries(domains)
    .filter(([_, detected]) => detected)
    .map(([domain]) => domain);
});