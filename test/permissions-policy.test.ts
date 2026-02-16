import assert from "node:assert/strict";
import { describe, it } from "node:test";
import permissionsPolicy from "../middlewares/permissions-policy/index.js";
import { check } from "./helpers.js";

describe("Permissions-Policy middleware", () => {
    it("throws when passed no options", () => {

        // @ts-expect-error
        assert.throws(() => permissionsPolicy(), {
            message: /^Permissions-Policy: at least one feature must be defined$/,
        });
    });

    it("throws when passed empty options", () => {
        assert.throws(() => permissionsPolicy({ features: {} }), {
            message: /^Permissions-Policy: at least one feature must be defined$/,
        });
    });

    it('sets "Permissions-Policy" header with one feature', async () => {
        await check(
            permissionsPolicy({
                features: {
                    geolocation: ["self", "https://example.com"],
                },
            }),
            {
                "permissions-policy": 'geolocation=(self "https://example.com")',
            },
        );
    });

    it('sets "Permissions-Policy" header with multiple features', async () => {
        await check(
            permissionsPolicy({
                features: {
                    geolocation: ["self"],
                    camera: ["*"],
                    microphone: [],
                },
            }),
            {
                "permissions-policy": "geolocation=(self), camera=*, microphone=()",
            },
        );
    });

    it("handles empty feature list as ()", async () => {
        await check(
            permissionsPolicy({
                features: {
                    payment: [],
                },
            }),
            {
                "permissions-policy": "payment=()",
            },
        );
    });

    it("handles * as *", async () => {
        await check(
            permissionsPolicy({
                features: {
                    usb: ["*"],
                },
            }),
            {
                "permissions-policy": "usb=*",
            },
        );
    });

    it('handles "self" and "src" unquoted', async () => {
        await check(
            permissionsPolicy({
                features: {
                    "midi": ["self", "src"],
                },
            }),
            {
                "permissions-policy": "midi=(self src)",
            },
        );
    });

    it("quotes other values", async () => {
        await check(
            permissionsPolicy({
                features: {
                    "sync-xhr": ["https://example.com"],
                },
            }),
            {
                "permissions-policy": 'sync-xhr=("https://example.com")',
            },
        );
    });
});
