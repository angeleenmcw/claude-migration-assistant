export const PROMPTS = {
  memoryCapture: `I'm migrating to a new Claude account. Please create a markdown file called memory-capture.md containing:

1. Your complete memory of me -- verbatim, exactly as stored
2. All memory edits I've made -- numbered, exact text
3. My work context: role, company, team, projects
4. My communication preferences: tone, format, length
5. Technical domains and tools I work with
6. Recurring workflows or patterns in how I use you
7. Anything else that helps you work effectively with me

Be exhaustive.`,

  projectBlueprint: `I'm migrating to a new Claude account. Please create a markdown file called project-blueprint.md containing:

1. Project name
2. The full custom instructions for this project (verbatim)
3. A list of all knowledge files uploaded to this project (filenames and brief description of each)
4. Summary of what we've worked on: key decisions, current status, important context, and any preferences specific to this project

Be exhaustive.`,

  memoryRestore: `I'm migrating from a previous Claude account. These two documents capture my profile, preferences, projects, and working patterns.

Please:
1. Read both documents carefully
2. Add the most important facts into your memory using the memory edit tool. Prioritize: role/company, active projects, communication preferences, key technical context.
3. List what you stored.`,

  projectFamiliarize: `This is the context from a previous account's version of this project. Please familiarize yourself with it.`,

  validate: `Based on everything you know about me, tell me:
- Who I am and what I do
- What projects or topics are top of mind for me
- How I prefer to communicate
- Any tools, frameworks, or domains I work in
- Anything else you consider important context

Be thorough -- I'm checking that migration was successful.`
};
