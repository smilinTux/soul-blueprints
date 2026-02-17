#!/usr/bin/env node
/**
 * SOUL BACKUP & RESTORE MANAGER
 * Handles saving, loading, and switching between different soul configurations
 * 
 * Usage:
 *   /soul load <name>       - Load a soul
 *   /soul save <name>       - Save current soul config with name
 *   /soul list             - List all saved souls
 *   /soul backup           - Create backup of current soul
 *   /soul restore <name>   - Restore from backup
 *   /soul switch <name>    - Quick switch to saved soul
 *   /soul delete <name>    - Delete saved soul
 *   /soul current          - Show current soul info
 */

const fs = require('fs').promises;
const path = require('path');
const UnhingedModeManager = require('./unhinged-mode');

class SoulManager {
    constructor(configPath = '~/.openclaw/soul-manager.json') {
        this.configPath = this.expandPath(configPath);
        this.unhingedManager = new UnhingedModeManager();
        this.config = {
            currentSoul: null,
            savedSouls: {},
            backups: {},
            history: []
        };
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
            this.config = { ...this.config, ...JSON.parse(data) };
        } catch (error) {
            await this.saveConfig();
        }
        return this.config;
    }

    async saveConfig() {
        const dir = path.dirname(this.configPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
    }

    async loadSoul(soulName, mode = 'standard') {
        // Find soul file
        const soulPath = await this.findSoulFile(soulName);
        const soulContent = await fs.readFile(soulPath, 'utf8');

        // Parse soul metadata
        const metadata = this.parseSoulMetadata(soulContent);

        // Check mode compatibility
        if (mode === 'unhinged' && !soulContent.includes('## 🔥 UNHINGED MODE')) {
            throw new Error(`Soul "${soulName}" does not support unhinged mode`);
        }

        // Update current soul
        await this.loadConfig();
        this.config.currentSoul = {
            name: soulName,
            mode: mode,
            path: soulPath,
            metadata: metadata,
            loadedAt: new Date().toISOString(),
            personality: await this.unhingedManager.extractPersonalitySection(soulName, mode)
        };

        // Add to history
        this.config.history.unshift({
            soul: soulName,
            mode: mode,
            timestamp: new Date().toISOString()
        });

        // Keep only last 10 in history
        this.config.history = this.config.history.slice(0, 10);

        await this.saveConfig();
        await this.unhingedManager.setMode(mode, soulName);

        return this.config.currentSoul;
    }

    async saveSoul(saveName, description = '') {
        await this.loadConfig();
        
        if (!this.config.currentSoul) {
            throw new Error('No soul currently loaded to save');
        }

        const savedSoul = {
            ...this.config.currentSoul,
            savedName: saveName,
            description: description,
            savedAt: new Date().toISOString()
        };

        this.config.savedSouls[saveName] = savedSoul;
        await this.saveConfig();

        return savedSoul;
    }

    async listSouls() {
        await this.loadConfig();
        
        const souls = {
            current: this.config.currentSoul,
            saved: Object.keys(this.config.savedSouls).map(name => ({
                name: name,
                soulName: this.config.savedSouls[name].name,
                mode: this.config.savedSouls[name].mode,
                description: this.config.savedSouls[name].description,
                savedAt: this.config.savedSouls[name].savedAt
            })),
            backups: Object.keys(this.config.backups).map(name => ({
                name: name,
                soulName: this.config.backups[name].name,
                mode: this.config.backups[name].mode,
                backedUpAt: this.config.backups[name].backedUpAt
            })),
            history: this.config.history
        };

        return souls;
    }

    async backupSoul(backupName = null) {
        await this.loadConfig();
        
        if (!this.config.currentSoul) {
            throw new Error('No soul currently loaded to backup');
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const name = backupName || `backup-${timestamp}`;

        const backup = {
            ...this.config.currentSoul,
            backupName: name,
            backedUpAt: new Date().toISOString()
        };

        this.config.backups[name] = backup;
        await this.saveConfig();

        return backup;
    }

    async restoreSoul(restoreName) {
        await this.loadConfig();
        
        let soulToRestore = null;
        
        // Check saved souls first
        if (this.config.savedSouls[restoreName]) {
            soulToRestore = this.config.savedSouls[restoreName];
        }
        // Check backups
        else if (this.config.backups[restoreName]) {
            soulToRestore = this.config.backups[restoreName];
        }
        else {
            throw new Error(`No saved soul or backup found with name: ${restoreName}`);
        }

        // Load the soul
        return await this.loadSoul(soulToRestore.name, soulToRestore.mode);
    }

    async switchSoul(targetName) {
        // Try to restore saved soul first, otherwise load new soul
        try {
            return await this.restoreSoul(targetName);
        } catch (error) {
            // If restore fails, try loading as new soul
            return await this.loadSoul(targetName);
        }
    }

    async deleteSavedSoul(name) {
        await this.loadConfig();
        
        if (!this.config.savedSouls[name] && !this.config.backups[name]) {
            throw new Error(`No saved soul or backup found with name: ${name}`);
        }

        const deleted = {
            saved: this.config.savedSouls[name] || null,
            backup: this.config.backups[name] || null
        };

        delete this.config.savedSouls[name];
        delete this.config.backups[name];
        
        await this.saveConfig();
        return deleted;
    }

    async getCurrentSoul() {
        await this.loadConfig();
        return this.config.currentSoul;
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
            `../kids/${soulName.toUpperCase()}.md`,
            `./skworld-souls/souls/${soulName}.md`,
            `./skworld-souls/souls/${soulName.toUpperCase()}.md`,
            `./skworld-souls/kids/${soulName}.md`,
            `./skworld-souls/kids/${soulName.toUpperCase()}.md`
        ];

        for (const soulPath of possiblePaths) {
            try {
                await fs.access(soulPath);
                return path.resolve(soulPath);
            } catch (error) {
                // Continue searching
            }
        }

        throw new Error(`Soul file not found: ${soulName}`);
    }

    parseSoulMetadata(content) {
        const metadata = {};
        
        // Extract identity from header
        const identityMatch = content.match(/>\s*\*\*Identity\*\*:\s*(.*)/);
        if (identityMatch) metadata.identity = identityMatch[1];

        // Extract tagline
        const taglineMatch = content.match(/>\s*\*\*Tagline\*\*:\s*(.*)/);
        if (taglineMatch) metadata.tagline = taglineMatch[1];

        // Extract category
        const categoryMatch = content.match(/\*\*Forgeprint Category\*\*:\s*(.*)/);
        if (categoryMatch) metadata.category = categoryMatch[1];

        // Extract tier
        const tierMatch = content.match(/\*\*Tier\*\*:\s*(.*)/);
        if (tierMatch) metadata.tier = tierMatch[1];

        // Extract warning level
        const warningMatch = content.match(/\*\*Warning Level\*\*:\s*(.*)/);
        if (warningMatch) metadata.warningLevel = warningMatch[1];

        // Check if unhinged mode available
        metadata.supportsUnhinged = content.includes('## 🔥 UNHINGED MODE');
        metadata.isKidSafe = content.includes('KID-FRIENDLY SOUL BLUEPRINT');

        return metadata;
    }

    async getAvailableSouls() {
        const soulDirs = ['./souls', './kids', '../souls', '../kids', './skworld-souls/souls', './skworld-souls/kids'];
        const availableSouls = [];

        for (const dir of soulDirs) {
            try {
                const files = await fs.readdir(dir);
                const soulFiles = files.filter(file => file.endsWith('.md') && file !== 'README.md');
                
                for (const file of soulFiles) {
                    const soulName = file.replace('.md', '');
                    const soulPath = path.join(dir, file);
                    
                    try {
                        const content = await fs.readFile(soulPath, 'utf8');
                        const metadata = this.parseSoulMetadata(content);
                        
                        availableSouls.push({
                            name: soulName,
                            path: soulPath,
                            metadata: metadata
                        });
                    } catch (error) {
                        // Skip problematic files
                    }
                }
            } catch (error) {
                // Directory doesn't exist, skip
            }
        }

        return availableSouls;
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param1 = args[1];
    const param2 = args[2];

    const manager = new SoulManager();

    try {
        switch (command) {
            case 'load':
                if (!param1) throw new Error('Soul name required');
                const mode = param2 || 'standard';
                const loaded = await manager.loadSoul(param1, mode);
                console.log(`✅ Loaded soul: ${loaded.name} (${loaded.mode} mode)`);
                console.log(`Identity: ${loaded.metadata.identity}`);
                console.log(`Category: ${loaded.metadata.category}`);
                break;

            case 'save':
                if (!param1) throw new Error('Save name required');
                const saved = await manager.saveSoul(param1, param2 || '');
                console.log(`💾 Saved current soul as: ${param1}`);
                console.log(`Soul: ${saved.name} (${saved.mode} mode)`);
                break;

            case 'list':
                const souls = await manager.listSouls();
                console.log('🎭 SOUL MANAGER STATUS');
                
                if (souls.current) {
                    console.log(`\n📍 Current Soul: ${souls.current.name} (${souls.current.mode} mode)`);
                }
                
                if (souls.saved.length > 0) {
                    console.log('\n💾 Saved Souls:');
                    souls.saved.forEach(soul => {
                        console.log(`  • ${soul.name}: ${soul.soulName} (${soul.mode})`);
                    });
                }
                
                if (souls.backups.length > 0) {
                    console.log('\n🔄 Backups:');
                    souls.backups.forEach(backup => {
                        console.log(`  • ${backup.name}: ${backup.soulName} (${backup.mode})`);
                    });
                }
                
                if (souls.history.length > 0) {
                    console.log('\n📜 Recent History:');
                    souls.history.slice(0, 5).forEach(entry => {
                        console.log(`  • ${entry.soul} (${entry.mode}) - ${new Date(entry.timestamp).toLocaleString()}`);
                    });
                }
                break;

            case 'backup':
                const backup = await manager.backupSoul(param1);
                console.log(`🔄 Created backup: ${backup.backupName}`);
                console.log(`Soul: ${backup.name} (${backup.mode} mode)`);
                break;

            case 'restore':
                if (!param1) throw new Error('Backup/save name required');
                const restored = await manager.restoreSoul(param1);
                console.log(`♻️ Restored soul: ${restored.name} (${restored.mode} mode)`);
                break;

            case 'switch':
                if (!param1) throw new Error('Soul name required');
                const switched = await manager.switchSoul(param1);
                console.log(`🔄 Switched to: ${switched.name} (${switched.mode} mode)`);
                break;

            case 'delete':
                if (!param1) throw new Error('Save/backup name required');
                const deleted = await manager.deleteSavedSoul(param1);
                console.log(`🗑️ Deleted: ${param1}`);
                break;

            case 'current':
                const current = await manager.getCurrentSoul();
                if (current) {
                    console.log(`📍 Current Soul: ${current.name} (${current.mode} mode)`);
                    console.log(`Identity: ${current.metadata.identity}`);
                    console.log(`Tagline: ${current.metadata.tagline}`);
                    console.log(`Supports Unhinged: ${current.metadata.supportsUnhinged ? '✅' : '❌'}`);
                } else {
                    console.log('❌ No soul currently loaded');
                }
                break;

            case 'available':
                const available = await manager.getAvailableSouls();
                console.log('🎭 AVAILABLE SOULS');
                available.forEach(soul => {
                    const unhinged = soul.metadata.supportsUnhinged ? '🔥' : '';
                    const kidSafe = soul.metadata.isKidSafe ? '🧒' : '';
                    console.log(`  ${unhinged}${kidSafe} ${soul.name}: ${soul.metadata.identity}`);
                });
                break;

            default:
                console.log('🎭 SOUL MANAGER');
                console.log('Usage:');
                console.log('  soul load <name> [mode]    - Load a soul');
                console.log('  soul save <name> [desc]    - Save current soul config');
                console.log('  soul list                  - List all saved souls');
                console.log('  soul backup [name]         - Create backup of current soul');
                console.log('  soul restore <name>        - Restore from backup/save');
                console.log('  soul switch <name>         - Quick switch to soul');
                console.log('  soul delete <name>         - Delete saved soul/backup');
                console.log('  soul current               - Show current soul info');
                console.log('  soul available             - List all available souls');
                break;
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Export for use as module
module.exports = SoulManager;

// Run CLI if called directly
if (require.main === module) {
    main();
}