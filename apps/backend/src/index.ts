import { expressApply } from "@repo/lib/server";

const instence = expressApply({
    port: 3000,
    routes: [],
    useLog: true,
    log_path: '/app/apps/backend/log'
})

instence.apply()