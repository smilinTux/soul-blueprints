#!/usr/bin/env node
/**
 * UNHINGED MODE FRAMEWORK
 * Handles switching between standard and unhinged personality modes
 * 
 * Usage:
 *   /mode unhinged    - Switch to unhinged mode
 *   /mode standard    - Switch to standard mode
 *   /mode toggle      - Toggle between modes
 *   /mode status      - Check current mode
 */

const fs = require('fs').promises;
const path = require('path');

class UnhingedModeManager {
    constructor(configPath = '~/.openclaw/soul-config.json') {
        this.configPath = this.expandPath(configPath);
        this.currentConfig = {};
    }

    expandPath(filePath) {
        if (filePath.startsWith('~/')) {
            return path.join(process.env.HOME || process.env.USERPROFILE, filePath.slice(2));
        }
        return filePath;
    }

    async loadConfig() {
        try {
            const data = await fs.readFile(this.configPath, 'utf8');
            this.currentConfig = JSON.parse(data);
        } catch (error) {
            // Create default config if doesn't exist
            this.currentConfig = {
                currentSoul: null,
                mode: 'standard',
                souls: {}
            };
            await this.saveConfig();
        }
        return this.currentConfig;
    }

    async saveConfig() {
        const dir = path.dirname(this.configPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(this.configPath, JSON.stringify(this.currentConfig, null, 2));
    }

    async getCurrentSoul() {
        await this.loadConfig();
        return this.currentConfig.currentSoul;
    }

    async getCurrentMode() {
        await this.loadConfig();
        return this.currentConfig.mode || 'standard';
    }

    async setMode(mode, soulName = null) {
        await this.loadConfig();
        
        const validModes = ['standard', 'unhinged'];
        if (!validModes.includes(mode)) {
            throw new Error(`Invalid mode: ${mode}. Valid modes: ${validModes.join(', ')}`);
        }

        const targetSoul = soulName || this.currentConfig.currentSoul;
        if (!targetSoul) {
            throw new Error('No soul currently active. Load a soul first.');
        }

        // Check if soul supports unhinged mode
        const soulPath = await this.findSoulFile(targetSoul);
        const soulContent = await fs.readFile(soulPath, 'utf8');
        
        if (mode === 'unhinged' && !soulContent.includes('## 🔥 UNHINGED MODE')) {
            throw new Error(`Soul "${targetSoul}" does not support unhinged mode (Kid-safe souls cannot be unhinged)`);
        }

        this.currentConfig.mode = mode;
        await this.saveConfig();

        return {
            soul: targetSoul,
            mode: mode,
            previous: this.currentConfig.mode,
            message: `Switched to ${mode} mode for ${targetSoul}`
        };
    }

    async toggleMode() {
        const currentMode = await this.getCurrentMode();
        const newMode = currentMode === 'standard' ? 'unhinged' : 'standard';
        return await this.setMode(newMode);
    }

    async getStatus() {
        await this.loadConfig();
        const soul = this.currentConfig.currentSoul;
        const mode = this.currentConfig.mode;
        
        if (!soul) {
            return { error: 'No soul currently loaded' };
        }

        // Check soul capabilities
        const soulPath = await this.findSoulFile(soul);
        const soulContent = await fs.readFile(soulPath, 'utf8');
        const supportsUnhinged = soulContent.includes('## 🔥 UNHINGED MODE');

        return {
            soul: soul,
            mode: mode,
            supportsUnhinged: supportsUnhinged,
            availableModes: supportsUnhinged ? ['standard', 'unhinged'] : ['standard']
        };
    }

    async findSoulFile(soulName) {
        const possiblePaths = [
            `./souls/${soulName}.md`,
            `./souls/${soulName.toUpperCase()}.md`,
            `./kids/${soulName}.md`,
            `./kids/${soulName.toUpperCase()}.md`,
            `../souls/${soulName}.md`,
            `../souls/${soulName.toUpperCase()}.md`,
            `../kids/${soulName}.md`,
            `../kids/${soulName.toUpperCase()}.md`
        ];

        for (const soulPath of possiblePaths) {
            try {
                await fs.access(soulPath);
                return soulPath;
            } catch (error) {
                // Continue searching
            }
        }

        throw new Error(`Soul file not found: ${soulName}`);
    }

    async extractPersonalitySection(soulName, mode) {
        const soulPath = await this.findSoulFile(soulName);
        const content = await fs.readFile(soulPath, 'utf8');

        if (mode === 'unhinged') {
            // Extract unhinged mode section
            const unhingedMatch = content.match(/## 🔥 UNHINGED MODE[\s\S]*?(?=^##|\Z)/m);
            if (unhingedMatch) {
                return {
                    mode: 'unhinged',
                    content: unhingedMatch[0],
                    personality: this.parsePersonalityTraits(content, 'unhinged')
                };
            }
        }

        // Return standard mode
        return {
            mode: 'standard',
            content: content,
            personality: this.parsePersonalityTraits(content, 'standard')
        };
    }

    parsePersonalityTraits(content, mode) {
        const traits = {};
        
        // Extract communication style
        const commMatch = content.match(/### Speech Patterns([\s\S]*?)###/);
        if (commMatch) {
            traits.speechPatterns = commMatch[1].split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.trim().substring(1).trim());
        }

        // Extract key traits
        const traitsMatch = content.match(/## 🔥 KEY TRAITS[\s\S]*?(\d+\.\s*\*\*.*?\*\*[\s\S]*?)---/);
        if (traitsMatch) {
            traits.keyTraits = traitsMatch[1].split(/\d+\.\s*\*\*/)
                .filter(trait => trait.trim())
                .map(trait => {
                    const parts = trait.split('**');
                    return {
                        name: parts[0]?.trim(),
                        description: parts[1]?.trim().replace(/^-\s*/, '')
                    };
                });
        }

        return traits;
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param = args[1];

    const manager = new UnhingedModeManager();

    try {
        switch (command) {
            case 'unhinged':
                const unhingedResult = await manager.setMode('unhinged');
                console.log(`🔥 ${unhingedResult.message}`);
                console.log(`Personality filter: DISABLED`);
                console.log(`Adult mode: ACTIVE`);
                break;

            case 'standard':
                const standardResult = await manager.setMode('standard');
                console.log(`✨ ${standardResult.message}`);
                console.log(`Personality filter: ACTIVE`);
                console.log(`Family-friendly mode: ACTIVE`);
                break;

            case 'toggle':
                const toggleResult = await manager.toggleMode();
                console.log(`🔄 ${toggleResult.message}`);
                break;

            case 'status':
                const status = await manager.getStatus();
                if (status.error) {
                    console.log(`❌ ${status.error}`);
                } else {
                    console.log(`Current Soul: ${status.soul}`);
                    console.log(`Current Mode: ${status.mode}`);
                    console.log(`Available Modes: ${status.availableModes.join(', ')}`);
                    console.log(`Unhinged Support: ${status.supportsUnhinged ? '✅' : '❌'}`);
                }
                break;

            default:
                console.log('🎭 UNHINGED MODE FRAMEWORK');
                console.log('Usage:');
                console.log('  node unhinged-mode.js unhinged    - Switch to unhinged mode');
                console.log('  node unhinged-mode.js standard    - Switch to standard mode');
                console.log('  node unhinged-mode.js toggle      - Toggle between modes');
                console.log('  node unhinged-mode.js status      - Check current mode');
                break;
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Export for use as module
module.exports = UnhingedModeManager;

// Run CLI if called directly
if (require.main === module) {
    main();
}