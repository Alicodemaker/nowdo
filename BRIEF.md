# Do Now: brief

**One line:** a phone-first, offline todo app for people with ADHD that makes *starting* effortless.

## Who it's for
One person, the founder: an adult with ADHD, executive dysfunction and low motivation who has set up Todoist, Notion, TickTick and others, then quit each one within weeks. v1 is built for them alone.

## The main problem
Lists are not what's missing; starting is. Big, vague tasks cause freezing, and full-featured todo apps add setup and decisions that cost the energy the person doesn't have.

## Version 1 must
- **Now screen** (the app opens here): show one Step, the next one in the Focus project, with a big **Start** button. Start runs a 2-minute timer, then asks "Keep going?". **Done** is always one tap.
- **Escape hatches** on Now: **Make it smaller** (tap a built-in first move such as "Open your PC", get a tailored one from Claude if a key is set, or type one), **Not now** (moves the Step to the end of the list) and **Switch project**.
- **Quick capture:** a **+** on Now saves a one-line Step to **Loose ends** without leaving the screen.
- **Projects screen:** list, create, set focus, and see Finished projects. Create a project by entering its name, then a **Brain dump**, spoken with a big mic button or typed. Claude turns the dump into tiny Steps, or an offline splitter does when there is no key or no network. The person reviews and edits them, and only then saves.
- **Steps:** edit, delete, move to top. Done Steps collapse under "Done (n)", with an undo toast.
- **Rewards:** a burst animation and a vibration when a Step is done, and a "Steps today" counter that resets at midnight. Finishing a Project brings a bigger celebration and a prompt to pick the next focus.
- **Settings:** Claude API key, Export backup, Import backup.

## Version 1 must NOT
Due dates, priorities, tags, reminders or notifications, streaks, points, sound, accounts, sync, nested steps, drag-to-reorder, Danish or any other second language, or anything that nags or shames.

## Look and feel
Bright and playful but restrained: warm, rounded and quick, with light and dark modes following the phone setting. The Start button is the most tempting thing on screen.

## Data
Projects and Steps (text, order, done time) live only in the browser on the device (ADR 0001). The API key is stored on the device too. Text leaves the phone only when the person taps a button that sends a Brain dump or a Step to Claude (ADR 0002).

## Success test
The founder is still opening it daily after two weeks.
