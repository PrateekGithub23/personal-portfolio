/**
 * Professional experience.
 *
 * Titles, employers and dates are copied exactly from the résumé. Descriptions are rewritten for
 * the web but only restate verified facts (swe-job-search/evidence/experience_inventory.json).
 * These are IT and security roles; they are described as such, never as software engineering roles.
 * Nothing internal (system names, counts, configurations) is published.
 */
import type { Role } from "./types";

export const roles: Role[] = [
  {
    org: "TD Bank",
    title: "Cyber Security Intern",
    dates: "Sept. 2026 – Present",
    location: "Toronto, ON",
    kind: "Co-op",
    summary: "Security engineering support: remediation, reporting and evaluating new tooling.",
    points: [
      "Write Python and shell scripts that pull VM inventory and check the status of security and monitoring agents; working toward a daily agent-status report (in progress).",
      "Support vulnerability remediation, and cybersecurity risk and compliance work through Archer finding management and risk reviews.",
      "Evaluate emerging security technologies through proof-of-concept work; build security dashboards, Confluence documentation and intake workflows.",
    ],
    tools: ["Python", "Shell", "Linux", "vCenter", "Archer", "Jira", "Confluence"],
  },
  {
    org: "Blake, Cassels & Graydon LLP",
    title: "IT Security Analyst",
    dates: "Jan. 2026 – Apr. 2026",
    location: "Toronto, ON",
    kind: "Co-op",
    summary: "Incident investigation and endpoint and identity security.",
    points: [
      "Investigated security incidents in Microsoft Defender and Azure AD, writing KQL queries over risky sign-ins and alerts to find unauthorized access such as anomalous locations and VPN-based logins.",
      "Managed endpoint and identity security with Intune and Defender: device signatures, security policies and vulnerability identification.",
      "Supported privileged access with CyberArk, monitored network activity in Palo Alto, and documented incident response workflows in ServiceNow.",
    ],
    tools: ["KQL", "Defender", "Azure AD", "Intune", "CyberArk", "Palo Alto", "ServiceNow"],
  },
  {
    org: "Colortech Incorporated",
    title: "IT Assistant",
    dates: "Apr. 2025 – Aug. 2025",
    location: "Brampton, ON",
    kind: "Co-op",
    summary: "Internal tooling: a React interface for account deactivation.",
    points: [
      "Built a user termination interface in React and Material UI to make account deactivation faster and less error-prone.",
      "Integrated REST APIs with React Hooks to manage user, server and company data, with validation and state-driven logic.",
    ],
    tools: ["React", "Material UI", "REST APIs"],
  },
  {
    org: "Algoma Central Corporation",
    title: "Intern, Business Information Systems",
    dates: "Winter 2024 & Fall 2024",
    location: "St. Catharines, ON",
    kind: "Co-op, two terms",
    summary: "Endpoint management, access provisioning and SQL reporting.",
    points: [
      "Managed endpoint security with Intune and ManageEngine: patching, deployment and compliance.",
      "Supported access provisioning, endpoint hardening, network troubleshooting and SQL reporting.",
    ],
    tools: ["Intune", "ManageEngine", "SQL"],
  },
];
