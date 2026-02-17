#!/usr/bin/env node
/**
 * SOUL BLUEPRINTS - OpenClaw Skill Entry Point
 * Main script that handles all soul blueprint commands for OpenClaw
 */

const OpenClawSoulIntegration = require('./framework/openclaw-integration');
const SoulManager = require('./framework/soul-manager');
const path = require('path');

class SoulBlueprintsSkill {
    constructor() {
        this.integration = new OpenClawSoulIntegration();
        this.soulManager = new SoulManager();
    }

    /**
     * Main entry point for OpenClaw skill execution
     * Handles all /soul and /mode commands
     */
    async execute(command, args = [], context = {}) {
        const fullCommand = `${command} ${args.join(' ')}`.trim();
        
        try {
            // Handle soul and mode commands
            if (command.startsWith('/soul') || command.startsWith('/mode')) {
                const result = await this.integration.processCommand(fullCommand, context.userMessage || '');
                return this.formatResponse(result);
            }
            
            // Handle direct soul management calls
            switch (command) {
                case 'available':
                case 'list-souls':
                    const available = await this.soulManager.getAvailableSouls();
                    return this.formatAvailableSouls(available);
                
                case 'current':
                case 'status':
                    const current = await this.soulManager.getCurrentSoul();
                    return current ? this.formatCurrentSoul(current) : 'No soul currently loaded';
                
                case 'load':
                    if (!args[0]) throw new Error('Soul name required');
                    const mode = args[1] || 'standard';
                    const loaded = await this.soulManager.loadSoul(args[0], mode);
                    return `✅ Loaded ${loaded.name} in ${loaded.mode} mode`;
                
                case 'help':
                case '--help':
                default:
                    return this.getHelpText();
            }
        } catch (error) {
            return `❌ Error: ${error.message}`;
        }
    }

    formatResponse(result) {
        if (result.error) {
            return `❌ ${result.error}`;
        }

        let response = result.message;
        
        if (result.warning) {
            response += `\n⚠️ ${result.warning}`;
        }

        if (result.soul) {
            response += `\n📍 Active: ${result.soul.name} (${result.soul.mode || result.mode} mode)`;
        }

        return response;
    }

    formatAvailableSouls(souls) {
        let response = '🎭 AVAILABLE SOUL BLUEPRINTS\n\n';
        
        const categories = {
            'Comedy Legends': [],
            'Comic Book Heroes': [],
            'Cultural Stereotypes': [],
            'Kid-Safe Companions': []
        };

        souls.forEach(soul => {
            if (soul.metadata.isKidSafe) {
                categories['Kid-Safe Companions'].push(soul);
            } else if (soul.metadata.category?.includes('Comedy')) {
                categories['Comedy Legends'].push(soul);
            } else if (soul.metadata.category?.includes('Comic Book')) {
                categories['Comic Book Heroes'].push(soul);
            } else {
                categories['Cultural Stereotypes'].push(soul);
            }
        });

        Object.entries(categories).forEach(([category, souls]) => {
            if (souls.length > 0) {
                response += `**${category} (${souls.length}):**\n`;
                souls.forEach(soul => {
                    const unhinged = soul.metadata.supportsUnhinged ? '🔥' : '';
                    const kidSafe = soul.metadata.isKidSafe ? '🧒' : '';
                    response += `  ${unhinged}${kidSafe} **${soul.name}** - ${soul.metadata.identity}\n`;
                });
                response += '\n';
            }
        });

        response += '**Usage:**\n';
        response += '  `/soul load <name>` - Load in standard mode\n';
        response += '  `/soul load <name> unhinged` - Load in unhinged mode (adults only)\n';
        response += '  `/mode toggle` - Switch between standard/unhinged\n';

        return response;
    }

    formatCurrentSoul(soul) {
        let response = `📍 **Current Soul: ${soul.name}**\n`;
        response += `Mode: ${soul.mode}\n`;
        response += `Identity: ${soul.metadata.identity}\n`;
        
        if (soul.metadata.tagline) {
            response += `Tagline: ${soul.metadata.tagline}\n`;
        }
        
        response += `Unhinged Support: ${soul.metadata.supportsUnhinged ? '✅' : '❌'}\n`;
        response += `Kid-Safe: ${soul.metadata.isKidSafe ? '✅' : '❌'}\n`;
        
        return response;
    }

    getHelpText() {
        return `🎭 **SOUL BLUEPRINTS SKILL**

**35 Unique AI Personalities** - Comedy legends, superheroes, cultural stereotypes, kid-safe companions

**Quick Commands:**
  \`/soul available\` - Browse all 35 soul blueprints
  \`/soul load <name>\` - Load a soul personality
  \`/soul current\` - Show active soul
  \`/mode unhinged\` - Enable authentic adult mode
  \`/mode standard\` - Family-friendly mode

**Collections:**
  🎤 **12 Comedy Legends** - Carlin, Chappelle, Pryor, Williams...
  🦸 **11 Comic Heroes** - Deadpool, Batman, Iron Man, Thor...
  🌍 **6 Cultural Stereotypes** - Self-aware humorous archetypes
  🧒 **6 Kid-Safe Souls** - Educational, confidence-building companions

**Soul Management:**
  \`/soul save <name>\` - Save current configuration
  \`/soul switch <name>\` - Switch to different personality
  \`/soul list\` - Show saved souls and backups

**Examples:**
  \`/soul load DEADPOOL unhinged\` - Load Deadpool with no filters
  \`/soul load GEORGE_CARLIN unhinged\` - Philosophy meets unfiltered truth
  \`/soul load FRIENDLY_DRAGON\` - Kid-safe adventure guide

**Browse Collection:**
  Open \`showcase.html\` for interactive browser with samples of all souls

*Ready to experience AI with actual personality?* 🎭✨`;
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    const params = args.slice(1);

    const skill = new SoulBlueprintsSkill();
    const result = await skill.execute(command, params);
    console.log(result);
}

// Export for OpenClaw integration
module.exports = SoulBlueprintsSkill;

// Run CLI if called directly
if (require.main === module) {
    main();
}