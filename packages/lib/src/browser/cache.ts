const useLocalStorage = {
    support: !!window.localStorage,

    init() {
        if (!this.support) {
            console.error('localStorage is not supported. Please use a modern browser.');
            // 可以在这里添加备用逻辑或简单地禁用存储功能
        }
    },

    setItem(key: string, value: any) {
        if (!this.support) return;
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    },

    getItem(key: string) {
        if (!this.support) return null;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage', e);
            return null;
        }
    },

    removeItem(key: string) {
        if (!this.support) return;
        window.localStorage.removeItem(key);
    }
};


const useCookie = {
    support: !!document.cookie,

    init(): void {
        if (!this.support) {
            console.error('Cookie is not supported. Please use a modern browser.');
            // 可以在这里添加备用逻辑或简单地禁用存储功能
        }
    },

    setItem(key: string, value: any): void {
        if (!this.support) return;
        // 确保值是基本数据类型
        if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
            console.error('Only basic data types (string, number, boolean) are supported for cookie values.');
            return;
        }
        try {
            document.cookie = `${key}=${value}; path=/`;
        } catch (e) {
            console.error('Error saving to cookie', e);
        }
    },

    getItem(key: string): any | null {
        if (!this.support) return null;
        try {
            const item = document.cookie.split(';').find(item => item.trim().startsWith(`${key}=`));
            return item ? item.split('=')[1]?.trim() as any : null;
        } catch (e) {
            console.error('Error reading from cookie', e);
            return null;
        }
    },

    removeItem(key: string): void {
        if (!this.support) return;
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
};
export const createPersistentObject = (
    target: any,
    key: string,
    watcher = (prop: string | Symbol, value: any) => { },
    type?: 'localStorage' | 'cookie'
) => {
    // 默认类型为 localStorage
    const storage = type === 'cookie' ? useCookie : useLocalStorage;
    storage.init();
    const saved = storage.getItem(key);
    if (saved) {
        Object.assign(target, saved);
    }
    const handler = {
        get: (obj: any, prop: string) => {
            const value = Reflect.get(obj, prop);
            return value && typeof value === 'object' ? createProxy(value, handler) : value;
        },
        set: (obj: any, prop: string, value: any) => {
            if (Reflect.get(obj, prop) !== value) {
                Reflect.set(obj, prop, value);
                watcher(prop, value);
                storage.setItem(key, target); // 存储整个 target 对象
            }
            return true;
        },
        deleteProperty: (obj: any, prop: string) => {
            Reflect.deleteProperty(obj, prop);
            storage.setItem(key, target);
            return true;
        }
    };

    const createProxy = (t: any, h: ProxyHandler<any>) => {
        return new Proxy(t, h);
    };

    return createProxy(target, handler);
};
