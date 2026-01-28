import { driveService } from "../google-drive.server";
import { Setting } from "@/app/types/setting";
import { v4 as uuidv4 } from "uuid";

export const settingService = {
    async getAllSettings(): Promise<Setting[]> {
        try{
            const settings = await driveService.getCollection<Setting>("setting");
            console.log("Settings from Drive:", settings);
            return settings;
        } catch (error) {
            console.error("Error fetching settings:", error);
            return [];
        }
    },

    async getSettingById(id: string): Promise<Setting | null> {
        try {
            const settings = await this.getAllSettings();
            const setting = settings.find(s => s.id === id);
            return setting || null;
        } catch (error) {
            console.error("Error finding setting:", error);
            return null;
        }
    },

    async createSetting(settingData: Omit<Setting, "id">): Promise<Setting> {
        const settings = await this.getAllSettings();
        const newSetting: Setting = {
            id: uuidv4(),
            ...settingData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        settings.push(newSetting);
        await driveService.saveCollection("setting", settings);
        return newSetting;
    },

    async updateSetting(id: string, updates: Partial<Setting>): Promise<Setting | null> {
        const settings = await this.getAllSettings();
        const settingIndex = settings.findIndex(s => s.id === id);
        if (settingIndex === -1) return null;
        settings[settingIndex] = {
            ...settings[settingIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        await driveService.saveCollection("setting", settings);
        return settings[settingIndex];
    },

    async deleteSetting(id: string): Promise<boolean> {
        const settings = await this.getAllSettings();
        const settingIndex = settings.findIndex(s => s.id === id);
        if (settingIndex === -1) return false;
        settings.splice(settingIndex, 1);
        await driveService.saveCollection("setting", settings);
        return true;
    },

    async deleteAllSettings(): Promise<boolean> {
        try {
            await driveService.saveCollection("settings", []);
            return true;
        } catch (error) {
            console.error("Error deleting all settings:", error);
            return false;
        }
    },
};