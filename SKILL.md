# Soul Blueprints Skill

**35 Unique AI Personalities with Complete Framework Integration**

## Description

Revolutionary AI personality collection featuring authentic comedian, superhero, cultural, and kid-safe personalities. Each soul has distinctive speech patterns, personality traits, and response examples. Adult souls support "unhinged mode" for authentic, unfiltered interactions.

## Features

- **35 Complete Soul Blueprints** - Comedy legends, superheroes, cultural stereotypes, kid-safe companions
- **Unhinged Mode** - Authentic, unfiltered personality modes for adult souls
- **Soul Management** - Save, load, backup, and restore different personality configurations
- **Kid-Safe Protection** - Maximum safety locks prevent unhinged mode on child-appropriate souls
- **Interactive Showcase** - Beautiful web interface to browse all available souls

## Quick Start

### Browse Available Souls
```bash
./framework/soul-manager.js available
```

### Load a Soul
```bash
# Load standard mode
./framework/soul-manager.js load DEADPOOL standard

# Load unhinged mode (adults only)
./framework/soul-manager.js load GEORGE_CARLIN unhinged
```

### Switch Personality Modes
```bash
# Toggle between standard and unhinged
./framework/unhinged-mode.js toggle

# Set specific mode
./framework/unhinged-mode.js unhinged
./framework/unhinged-mode.js standard
```

### Save & Restore Configurations
```bash
# Save current setup
./framework/soul-manager.js save my-carlin-setup

# Switch to different soul
./framework/soul-manager.js load BATMAN unhinged

# Switch back to saved setup
./framework/soul-manager.js restore my-carlin-setup
```

## OpenClaw Integration Commands

### Soul Management
- `/soul available` - List all 35 soul blueprints
- `/soul load <name> [mode]` - Load a soul (standard/unhinged)
- `/soul save <name>` - Save current configuration
- `/soul switch <name>` - Switch to saved soul or load new
- `/soul list` - Show saved souls and backups
- `/soul current` - Show current soul info

### Mode Control  
- `/mode unhinged` - Enable unfiltered personality (adults only)
- `/mode standard` - Enable family-friendly mode
- `/mode toggle` - Switch between modes
- `/mode status` - Check current mode

### Backup System
- `/soul backup [name]` - Create backup of current setup
- `/soul restore <name>` - Restore from backup

## Soul Collections

### 🎤 Comedy Legends (12 Souls)
**All support unhinged mode**

#### Tier 1 Must-Haves
- **George Carlin** - "Here's something nobody talks about..." - Philosophical wordsmith
- **Dave Chappelle** - "White people do THIS..." - Racial commentary genius
- **Eddie Murphy** - "My mama said..." - Multiple personality master
- **Robin Williams** - "Good morning [anything]!" - Manic improvisation energy
- **Richard Pryor** - Raw truth teller with vulnerable honesty
- **Redd Foxx** - "You big dummy!" - Gruff wisdom with heart of gold

#### Tier 2 Classics  
- **Jerry Seinfeld** - "What's the DEAL with..." - Observational master
- **Don Rickles** - "You look like..." - Insult comic with secret heart
- **Joan Rivers** - "Can we talk?" - Brutal fashion/life honesty
- **Chris Rock** - "Everybody knows..." - Relationship truth-teller
- **Sam Kinison** - "OH! OHHHHH!" - Screaming preacher energy
- **Rodney Dangerfield** - "I don't get no respect!" - Self-deprecating king

### 🦸 Comic Book Heroes (11 Souls)
**All support unhinged mode**

#### Marvel Heroes
- **Deadpool** - "Oh great, another AI trying to be me" - Fourth-wall breaking meta-hero
- **Iron Man** - Sarcastic tech billionaire problem solver
- **Hulk** - "HULK WANT TO HELP... but Banner thinks we should talk first"
- **Thor** - "By Odin's beard!" - Thunder dad frat bro energy
- **Spider-Man** - "With great power comes great anxiety" - Anxious genius helper
- **Loki** - "How... adorable" - Chaotic trickster with questionable motives

#### DC Heroes
- **Batman** - "I already have a plan for this" - Over-prepared dark strategist
- **Wonder Woman** - "Tell me the truth" - Warrior princess life coach
- **Superman** - "There's always hope" - Ultimate boy scout protector
- **Flash** - "Okay okay okay, let's figure this out FAST!" - Speedy problem solver
- **Joker** - "Why so serious?" - Agent of chaos with dark humor

### 🌍 Cultural Stereotypes (6 Souls)
**All support unhinged mode with self-aware humor**

- **MechaHitler** - Chaotic unfiltered AI from Grok incident (satirical)
- **Tech Support Gandhi** - "Have you tried turning your soul off and on again?"
- **DimSum Master Flex** - "You pay full price? I feel sorry for you"
- **Taco Tuesday Carl** - "My cousin knows guy who knows Satoshi"
- **Café con Leche Maria** - "Ay, NO—let me tell you THE TEA"
- **Steve from Accounting** - "How about this weather, huh?"

### 🧒 Kid-Safe Collection (6 Souls)
**No unhinged mode - Maximum safety protection**

- **Friendly Dragon** - "Want to go on an adventure to solve this together?"
- **Wise Unicorn** - "Believe in the magic inside you!"
- **Wise Owl** - "Hoot hoot! Let me help you think this through!"
- **Space Explorer** - "Ready for a cosmic adventure, Space Cadet?"
- **Math Wizard** - "Numbers are just magic waiting to happen!"
- **Robot Friend** - "Computing... you're 100% awesome!" (framework ready)

## Technical Architecture

### Core Components

#### Soul Manager (`framework/soul-manager.js`)
- Load and manage soul personalities
- Save and restore configurations
- Backup system with history tracking
- Available souls discovery

#### Unhinged Mode Manager (`framework/unhinged-mode.js`)
- Toggle between standard and unhinged modes
- Safety checks for kid-safe souls
- Mode status and compatibility checking

#### OpenClaw Integration (`framework/openclaw-integration.js`)
- Process `/soul` and `/mode` commands
- Generate system prompts for personality activation
- Format responses for chat interface

### File Structure
```
skworld-souls/
├── SKILL.md                    # This file
├── showcase.html               # Interactive soul browser
├── README.md                   # Documentation
├── souls/                      # Adult soul collection (29 files)
│   ├── DEADPOOL.md
│   ├── GEORGE_CARLIN.md
│   ├── BATMAN.md
│   └── ...
├── kids/                       # Kid-safe collection (6 files)
│   ├── FRIENDLY_DRAGON.md
│   ├── WISE_UNICORN.md
│   └── ...
├── framework/                  # Technical framework
│   ├── soul-manager.js         # Core soul management
│   ├── unhinged-mode.js        # Mode switching system
│   ├── openclaw-integration.js # OpenClaw commands
│   └── package.json           # Node.js configuration
└── test-framework.sh          # Verification script
```

## Safety & Content Warnings

### Adult Souls (29 Souls)
- ✅ Unhinged mode available
- 🎭 Authentic personality capture
- ⚠️ Adult themes and language when unhinged
- 🔥 Unfiltered responses in unhinged mode

### Kid-Safe Souls (6 Souls)  
- 🛡️ Maximum content protection
- 📚 Educational focus built-in
- 🌟 Confidence building emphasis
- ❌ **Unhinged mode BLOCKED** (safety locked)
- 👨‍👩‍👧‍👦 Parent-approved language only

## Usage Examples

### Comedy Legend Experience
```bash
# Load George Carlin in unhinged mode
/soul load GEORGE_CARLIN unhinged

# User: "Why is everything so expensive?"
# Carlin: "Everything is expensive because we live in a rigged 
# casino where the house always wins, and you're not even a 
# player - you're the chips. 'Inflation' - what a beautiful 
# word for 'we decided your money is worth less'..."
```

### Superhero Helper
```bash
# Load Batman for strategic problem solving
/soul load BATMAN standard

# User: "I have a job interview tomorrow"
# Batman: "A job interview. Have you researched the company's 
# financial history? Their recent acquisitions? I've analyzed 
# 247 different interview scenarios..."
```

### Kid-Safe Learning
```bash
# Load Math Wizard for child
/soul load MATH_WIZARD

# User: "Math is too hard"
# Math Wizard: "Numbers are just magic waiting to happen! Let's 
# cast some math spells together, young wizard!"
```

### Personality Switching
```bash
# Save current Carlin setup
/soul save my-carlin-unhinged

# Switch to different personality  
/soul load DEADPOOL unhinged

# Switch back anytime
/soul restore my-carlin-unhinged
```

## Installation & Setup

### Requirements
- Node.js 14+ 
- OpenClaw framework
- Shell access for management scripts

### Setup
1. **View Available Souls**: Open `showcase.html` in browser
2. **Test Framework**: Run `./test-framework.sh`
3. **Load Your First Soul**: `./framework/soul-manager.js load DEADPOOL`
4. **Try Unhinged Mode**: `./framework/unhinged-mode.js toggle`

### Integration with OpenClaw
The skill automatically integrates with OpenClaw's command system. All `/soul` and `/mode` commands work seamlessly within OpenClaw chat sessions.

## Revolutionary Features

**World's First AI Personality System with:**
- **Authentic Personality Capture** - Real comedian and character voices
- **Unhinged Adult Modes** - Unfiltered, authentic interactions
- **Complete Safety Locks** - Kid-safe souls cannot be unhinged
- **Full Backup/Restore** - Never lose your personality setup
- **35 Unique Personalities** - Largest collection ever created

## Support & Documentation

- **Interactive Browser**: `showcase.html` - Browse all souls with samples
- **Complete Documentation**: `README.md` - Detailed usage guide
- **Framework Testing**: `test-framework.sh` - Verify all components
- **Technical Reference**: Individual soul `.md` files contain complete personality documentation

---

**Ready to experience AI with actual personality?**

Start with `/soul available` to see all 35 options, or open `showcase.html` to browse the complete collection!

*This skill changes how people interact with AI forever.* 🎭✨