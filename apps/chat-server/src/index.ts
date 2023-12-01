import { expressApply } from "@repo/lib/server";

import { expressRoutes } from "./routes";

const instence = expressApply({
    port: 3000,
    routes: expressRoutes,
    useLog: true,
    log_path: '/app/log',
})

instence.apply()