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

console.log("\n" + "=".repeat(80));
console.log("TESTING YEARS OF EXPERIENCE EXTRACTION");
console.log("=".repeat(80) + "\n");

testCVs.forEach((cv, index) => {
  console.log("\n" + "-".repeat(80));
  console.log(`TEST ${index + 1}:`);
  console.log(`Input: "${cv.substring(0, 80)}${cv.length > 80 ? "..." : ""}"`);
  console.log("-".repeat(80));

  const result = extractYearsExperience(cv);

  console.log("\n📊 RESULT:");
  console.log(JSON.stringify(result, null, 2));

  const domains = detectDomainExperience(cv);
  console.log("\n🎯 DOMAINS DETECTED:");
  const detectedDomains = Object.entries(domains)
    .filter(([_, detected]) => detected)
    .map(([domain]) => domain);
  console.log(detectedDomains.length > 0 ? detectedDomains : "None");
});

console.log("\n" + "=".repeat(80));
console.log("TEST COMPLETE");
console.log("=".repeat(80) + "\n");
