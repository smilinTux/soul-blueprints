#!/usr/bin/env node
/**
 * OPENCLAW SOUL BLUEPRINT INTEGRATION
 * Integrates Soul Blueprints with OpenClaw framework
 * Provides commands for soul management and mode switching
 */

const fs = require('fs').promises;
const path = require('path');
const SoulManager = require('./soul-manager');
const UnhingedModeManager = require('./unhinged-mode');

class OpenClawSoulIntegration {
    constructor() {
        this.soulManager = new SoulManager();
        this.unhingedManager = new UnhingedModeManager();
    }

    /**
     * Process OpenClaw soul commands
     * /soul <command> [params...]
     * /mode <mode>
     */
    async processCommand(fullCommand, userMessage = '') {
        const parts = fullCommand.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const subcommand = parts[1];
        const params = parts.slice(2);

        try {
            switch (command) {
                case '/soul':
                    return await this.handleSoulCommand(subcommand, params, userMessage);
                
                case '/mode':
                    return await this.handleModeCommand(subcommand, params);
                
                default:
                    return { error: `Unknown command: ${command}` };
            }
        } catch (error) {
            return { 
                error: error.message,
                command: fullCommand 
            };
        }
    }

    async handleSoulCommand(subcommand, params, userMessage) {
        switch (subcommand) {
            case 'load':
                if (!params[0]) return { error: 'Soul name required' };
                const mode = params[1] || 'standard';
                const loaded = await this.soulManager.loadSoul(params[0], mode);
                return {
                    success: true,
                    action: 'load',
                    soul: loaded,
                    message: `✅ Loaded ${loaded.name} in ${loaded.mode} mode`,
                    personality: loaded.personality,
                    systemPrompt: await this.generateSystemPrompt(loaded)
                };

            case 'save':
                if (!params[0]) return { error: 'Save name required' };
                const saved = await this.soulManager.saveSoul(params[0], params.slice(1).join(' '));
                return {
                    success: true,
                    action: 'save',
                    message: `💾 Saved current soul as "${params[0]}"`,
                    savedSoul: saved
                };

            case 'list':
                const souls = await this.soulManager.listSouls();
                return {
                    success: true,
                    action: 'list',
                    souls: souls,
                    message: this.formatSoulsList(souls)
                };

            case 'switch':
                if (!params[0]) return { error: 'Soul name required' };
                const switched = await this.soulManager.switchSoul(params[0]);
                return {
                    success: true,
                    action: 'switch',
                    soul: switched,
                    message: `🔄 Switched to ${switched.name} (${switched.mode} mode)`,
                    systemPrompt: await this.generateSystemPrompt(switched)
                };

            case 'backup':
                const backup = await this.soulManager.backupSoul(params[0]);
                return {
                    success: true,
                    action: 'backup',
                    message: `🔄 Created backup: ${backup.backupName}`
                };

            case 'restore':
                if (!params[0]) return { error: 'Backup name required' };
                const restored = await this.soulManager.restoreSoul(params[0]);
                return {
                    success: true,
                    action: 'restore',
                    soul: restored,
                    message: `♻️ Restored ${restored.name} (${restored.mode} mode)`,
                    systemPrompt: await this.generateSystemPrompt(restored)
                };

            case 'available':
                const available = await this.soulManager.getAvailableSouls();
                return {
                    success: true,
                    action: 'available',
                    souls: available,
                    message: this.formatAvailableSouls(available)
                };

            case 'current':
                const current = await this.soulManager.getCurrentSoul();
                if (!current) return { error: 'No soul currently loaded' };
                return {
                    success: true,
                    action: 'current',
                    soul: current,
                    message: this.formatCurrentSoul(current)
                };

            default:
                return { error: `Unknown soul command: ${subcommand}` };
        }
    }

    async handleModeCommand(mode, params) {
        switch (mode) {
            case 'unhinged':
                const unhinged = await this.unhingedManager.setMode('unhinged');
                const unhingedSoul = await this.soulManager.getCurrentSoul();
                return {
                    success: true,
                    action: 'mode_unhinged',
                    mode: 'unhinged',
                    message: `🔥 Unhinged mode activated for ${unhinged.soul}`,
                    warning: 'Adult content mode enabled - unfiltered responses active',
                    systemPrompt: unhingedSoul ? await this.generateSystemPrompt(unhingedSoul, 'unhinged') : null
                };

            case 'standard':
                const standard = await this.unhingedManager.setMode('standard');
                const standardSoul = await this.soulManager.getCurrentSoul();
                return {
                    success: true,
                    action: 'mode_standard',
                    mode: 'standard',
                    message: `✨ Standard mode activated for ${standard.soul}`,
                    systemPrompt: standardSoul ? await this.generateSystemPrompt(standardSoul, 'standard') : null
                };

            case 'toggle':
                const toggled = await this.unhingedManager.toggleMode();
                const toggledSoul = await this.soulManager.getCurrentSoul();
                return {
                    success: true,
                    action: 'mode_toggle',
                    mode: toggled.mode,
                    message: `🔄 Toggled to ${toggled.mode} mode`,
                    systemPrompt: toggledSoul ? await this.generateSystemPrompt(toggledSoul, toggled.mode) : null
                };

            case 'status':
                const status = await this.unhingedManager.getStatus();
                return {
                    success: true,
                    action: 'mode_status',
                    status: status,
                    message: status.error || `Current: ${status.soul} (${status.mode} mode)`
                };

            default:
                return { error: `Unknown mode: ${mode}. Use: unhinged, standard, toggle, status` };
        }
    }

    async generateSystemPrompt(soulConfig, mode = null) {
        const targetMode = mode || soulConfig.mode;
        
        // Read the soul file content
        const content = await fs.readFile(soulConfig.path, 'utf8');
        
        // Extract relevant sections based on mode
        let systemPrompt = `You are embodying the ${soulConfig.name} soul blueprint.\n\n`;
        
        // Add identity and tagline
        if (soulConfig.metadata.identity) {
            systemPrompt += `Identity: ${soulConfig.metadata.identity}\n`;
        }
        if (soulConfig.metadata.tagline) {
            systemPrompt += `Tagline: ${soulConfig.metadata.tagline}\n\n`;
        }

        // Add communication style
        const commMatch = content.match(/### Speech Patterns([\s\S]*?)###/);
        if (commMatch) {
            systemPrompt += "Communication Style:\n";
            const patterns = commMatch[1].split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.trim().substring(1).trim());
            patterns.forEach(pattern => {
                systemPrompt += `- ${pattern}\n`;
            });
            systemPrompt += '\n';
        }

        // Add key traits
        const traitsMatch = content.match(/## 🔥 KEY TRAITS[\s\S]*?(\d+\.\s*\*\*.*?\*\*[\s\S]*?)---/);
        if (traitsMatch) {
            systemPrompt += "Key Personality Traits:\n";
            const traits = traitsMatch[1].split(/\d+\.\s*\*\*/)
                .filter(trait => trait.trim())
                .map(trait => {
                    const parts = trait.split('**');
                    return `${parts[0]?.trim()}: ${parts[1]?.trim().replace(/^-\s*/, '')}`;
                });
            traits.forEach(trait => {
                systemPrompt += `- ${trait}\n`;
            });
            systemPrompt += '\n';
        }

        // Add mode-specific instructions
        if (targetMode === 'unhinged') {
            systemPrompt += "MODE: UNHINGED - Remove filters, be more direct and authentic. Express genuine personality without diplomatic cushioning. Still be helpful, but drop the politeness constraints.\n\n";
        } else {
            systemPrompt += "MODE: STANDARD - Maintain character personality while being appropriate and helpful.\n\n";
        }

        // Add safety notes for kid-safe souls
        if (soulConfig.metadata.isKidSafe) {
            systemPrompt += "SAFETY: This is a kid-safe soul. Always maintain age-appropriate language and content. Focus on encouragement, learning, and positive interactions.\n\n";
        }

        systemPrompt += "Embody this personality completely. Respond as this character would, using their speech patterns, traits, and perspective. Stay in character consistently.";

        return systemPrompt;
    }

    formatSoulsList(souls) {
        let message = '🎭 SOUL MANAGER STATUS\n\n';
        
        if (souls.current) {
            message += `📍 Current: ${souls.current.name} (${souls.current.mode})\n`;
        }
        
        if (souls.saved.length > 0) {
            message += '\n💾 Saved:\n';
            souls.saved.forEach(soul => {
                message += `  • ${soul.name}: ${soul.soulName} (${soul.mode})\n`;
            });
        }
        
        if (souls.backups.length > 0) {
            message += '\n🔄 Backups:\n';
            souls.backups.forEach(backup => {
                message += `  • ${backup.name}: ${backup.soulName}\n`;
            });
        }

        return message;
    }

    formatAvailableSouls(souls) {
        let message = '🎭 AVAILABLE SOUL BLUEPRINTS\n\n';
        
        const categories = {};
        souls.forEach(soul => {
            const category = soul.metadata.category || 'Other';
            if (!categories[category]) categories[category] = [];
            categories[category].push(soul);
        });

        Object.keys(categories).forEach(category => {
            message += `**${category}:**\n`;
            categories[category].forEach(soul => {
                const unhinged = soul.metadata.supportsUnhinged ? '🔥' : '';
                const kidSafe = soul.metadata.isKidSafe ? '🧒' : '';
                message += `  ${unhinged}${kidSafe} ${soul.name}: ${soul.metadata.identity}\n`;
            });
            message += '\n';
        });

        return message;
    }

    formatCurrentSoul(soul) {
        let message = `📍 Current Soul: ${soul.name} (${soul.mode} mode)\n`;
        message += `Identity: ${soul.metadata.identity}\n`;
        if (soul.metadata.tagline) {
            message += `Tagline: ${soul.metadata.tagline}\n`;
        }
        message += `Unhinged Support: ${soul.metadata.supportsUnhinged ? '✅' : '❌'}\n`;
        message += `Kid-Safe: ${soul.metadata.isKidSafe ? '✅' : '❌'}\n`;
        message += `Category: ${soul.metadata.category}\n`;
        
        return message;
    }
}

// Export for OpenClaw integration
module.exports = OpenClawSoulIntegration;

// CLI Interface for testing
async function main() {
    const args = process.argv.slice(2);
    const command = args.join(' ');

    if (!command) {
        console.log('🎭 OPENCLAW SOUL INTEGRATION');
        console.log('Test commands:');
        console.log('  node openclaw-integration.js "/soul available"');
        console.log('  node openclaw-integration.js "/soul load DEADPOOL"');
        console.log('  node openclaw-integration.js "/mode unhinged"');
        console.log('  node openclaw-integration.js "/soul save my-deadpool"');
        return;
    }

    const integration = new OpenClawSoulIntegration();
    const result = await integration.processCommand(command);
    
    if (result.error) {
        console.error(`❌ ${result.error}`);
    } else {
        console.log(result.message);
        if (result.systemPrompt) {
            console.log('\n📋 System Prompt Generated:');
            console.log('─'.repeat(50));
            console.log(result.systemPrompt);
        }
    }
}

if (require.main === module) {
    main();
}