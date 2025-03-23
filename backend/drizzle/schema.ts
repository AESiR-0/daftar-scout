import * as users from "./models/users";
import * as daftar from "./models/daftar";
import * as scouts from "./models/scouts";
import * as pitch from "./models/pitch";

export const schema = {
    users: users.users,
    ...daftar,
    ...scouts,
    ...pitch,
};
