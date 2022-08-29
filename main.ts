import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { text } from 'stream/consumers';

enum ProxyType_e {
    none = 0,
    http = 1,
    socks5 = 2
}

interface ObsidianProxySettings {
    ProxyType: ProxyType_e;
    ProxyAddress: string;
    ProxyPort: number;
    ProxyUsername: string;
    ProxyPassword: string;
    EnableProxy: boolean;
}

const DEFAULT_SETTINGS: ObsidianProxySettings = {
    ProxyType: ProxyType_e.none,
    ProxyAddress: '',
    ProxyPort: 0,
    ProxyUsername: '',
    ProxyPassword: '',
    EnableProxy: false
}

class ObsidianProxySettingTab extends PluginSettingTab {
    constructor(app: App, plugin: ObsidianProxyPlugin) {
        console.log('Setting Tab Loaded')
        super(app, plugin)
        this.plugin = plugin
    }
    plugin: ObsidianProxyPlugin
    display(): void {
        const {containerEl} = this
        containerEl.empty();
        containerEl.createEl('h2', {text: 'Obsidian Proxy Setup'});
        new Setting(containerEl)
            .setName('Proxy Type')
            .setDesc('Select protocol of proxy server')
            .addDropdown(dropDown => {
                dropDown.addOption('Type', 'None');
                dropDown.addOption('None', 'None');
                dropDown.addOption('HTTP', 'HTTP');
                dropDown.addOption('Socks5', 'Socks5');
                dropDown.onChange(async (value) => {
                    switch(value) {
                        case 'HTTP':
                            this.plugin.settings.ProxyType = ProxyType_e.http;
                            break;
                        case 'Socks5':
                            this.plugin.settings.ProxyType = ProxyType_e.socks5;
                            break;
                        case 'None':
                            this.plugin.settings.ProxyType = ProxyType_e.none;
                            break;
                        default:
                            this.plugin.settings.ProxyType = ProxyType_e.none;
                            break;
                    }
                    await this.plugin.saveSettings()
                })
            });
        new Setting(containerEl)
            .setName('Proxy Address')
            .setDesc('Address of proxy server')
            .addText(text => text
                .setPlaceholder('Proxy Address')
                .setValue(this.plugin.settings.ProxyAddress)
                .onChange(async(value) => {
                    this.plugin.settings.ProxyAddress = value;
                    await this.plugin.saveSettings();
                })
            );
        new Setting(containerEl)
            .setName('Proxy Port')
            .setDesc('Port of proxy server')
            .addText(text => text
                .setPlaceholder('Proxy Port')
                .setValue(String(this.plugin.settings.ProxyPort))
                .onChange(async(value) => {
                    if(isNaN(Number(value))) {
                        console.log('Invalid Value');
                    } else {
                        this.plugin.settings.ProxyPort = Number(value);
                    }
                    await this.plugin.saveSettings();
                })
            );
        new Setting(containerEl)
            .setName('Proxy Username')
            .setDesc('Username of proxy server account')
            .addText(text => text
                .setPlaceholder('Proxy Username')
                .setValue(this.plugin.settings.ProxyUsername)
                .onChange(async(value)=>{
                    this.plugin.settings.ProxyUsername = value;
                    await this.plugin.saveSettings();
                })
            );
        new Setting(containerEl)
            .setName('Proxy Password')
            .setDesc('Password of proxy server account')
            .addText(text => text
                .setPlaceholder('Proxy Password')
                .setValue(this.plugin.settings.ProxyPassword)
                .onChange(async(value) => {
                    this.plugin.settings.ProxyPassword = value;
                    await this.plugin.saveSettings();
                })
            );
        new Setting(containerEl)
            .setName('Enable')
            .addDropdown(dropDown => {
                dropDown.addOption('Enable', 'Enable');
                dropDown.addOption('Disable', 'Disable');
                dropDown.onChange(async(value) => {
                    switch(value) {
                        case 'Enable':
                            this.plugin.settings.EnableProxy = true;
                            break;
                        case 'Disable':
                            this.plugin.settings.EnableProxy = false;
                            break;
                        default:
                            break
                    }
                    await this.plugin.saveSettings();
                });
            })
    }
}

export default class ObsidianProxyPlugin extends Plugin {
    settings: ObsidianProxySettings
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    }
    async saveSettings() {
        await this.saveData(this.settings)
    }
    onunload(): void {}
    async onload() {
        await this.loadSettings()
        this.addSettingTab(new ObsidianProxySettingTab(this.app, this));
    }
}