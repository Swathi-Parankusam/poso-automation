import type { Locator, Page } from '@playwright/test';
import type { LocatorConfig } from './LocatorConfig.js';

import fs from 'node:fs';
import path from 'node:path';

type HealingCache = Record<string, LocatorConfig>;

type Candidate = {
    tag: string;
    id: string;
    name: string;
    type: string;
    placeholder: string;
    ariaLabel: string;
    title: string;
    text: string;
    testId: string;
    accept: string;
    score: number;
};

export class SelfHealingLocator {

    private readonly page: Page;
    private readonly cachePath: string;
    private readonly auditPath: string;

    constructor(page: Page) {

        this.page = page;

        this.cachePath = path.resolve(
            process.cwd(),
            'resources',
            'healing-cache.json'
        );

        this.auditPath = path.resolve(
            process.cwd(),
            'healing-logs',
            'healing-audit.log'
        );
    }

    // ==================================================
    // CACHE
    // ==================================================

    private readCache(): HealingCache {

        if (!fs.existsSync(this.cachePath)) {
            return {};
        }

        try {

            const content = fs.readFileSync(
                this.cachePath,
                'utf8'
            ).trim();

            if (!content) {
                return {};
            }

            const parsed: unknown = JSON.parse(content);

            if (
                typeof parsed !== 'object' ||
                parsed === null ||
                Array.isArray(parsed)
            ) {
                throw new Error(
                    'Cache must contain a JSON object.'
                );
            }

            return parsed as HealingCache;

        } catch (error) {

            this.log(
                `CACHE_READ_ERROR | ${String(error)}`
            );

            return {};
        }
    }

    private saveCache(
        key: string,
        config: LocatorConfig
    ): void {

        try {

            const cache = this.readCache();

            cache[key] = config;

            fs.mkdirSync(
                path.dirname(this.cachePath),
                {
                    recursive: true
                }
            );

            fs.writeFileSync(
                this.cachePath,
                JSON.stringify(cache, null, 2),
                'utf8'
            );

            this.log(
                `CACHE_SAVED | ${key} | ` +
                `${JSON.stringify(config)}`
            );

        } catch (error) {

            this.log(
                `CACHE_SAVE_ERROR | ${key} | ` +
                `${String(error)}`
            );
        }
    }

    // ==================================================
    // AUDIT LOG
    // ==================================================

    private log(message: string): void {

        try {

            fs.mkdirSync(
                path.dirname(this.auditPath),
                {
                    recursive: true
                }
            );

            fs.appendFileSync(
                this.auditPath,
                `${new Date().toISOString()} | ${message}\n`,
                'utf8'
            );

        } catch {
            // Logging must never stop test execution.
        }
    }

    // ==================================================
    // CREATE PLAYWRIGHT LOCATOR
    // ==================================================

    private createLocator(
        config: LocatorConfig
    ): Locator {

        switch (config.type) {

            case 'css':

                return this.page.locator(
                    config.value
                );

            case 'xpath':

                return this.page.locator(
                    `xpath=${config.value}`
                );

            case 'placeholder':

                return this.page.getByPlaceholder(
                    config.value,
                    {
                        exact: true
                    }
                );

            case 'label':

                return this.page.getByLabel(
                    config.value,
                    {
                        exact: true
                    }
                );

            case 'text':

                return this.page.getByText(
                    config.value,
                    {
                        exact: true
                    }
                );

            case 'testId':

                return this.page.getByTestId(
                    config.value
                );

            case 'altText':

                return this.page.getByAltText(
                    config.value,
                    {
                        exact: true
                    }
                );

            case 'role':

                return this.page.getByRole(
                    config.role as Parameters<
                        Page['getByRole']
                    >[0],
                    {
                        name: config.name,
                        exact: true
                    }
                );

            default:

                throw new Error(
                    `Unsupported locator configuration: ` +
                    `${JSON.stringify(config)}`
                );
        }
    }

    // ==================================================
    // NORMALIZE TEXT
    // ==================================================

    private normalizeText(
        value: string
    ): string {

        return value
            .replace(
                /([a-z])([A-Z])/g,
                '$1 $2'
            )
            .replace(
                /[-_]+/g,
                ' '
            )
            .replace(
                /[^a-zA-Z0-9\s]/g,
                ' '
            )
            .replace(
                /\s+/g,
                ' '
            )
            .toLowerCase()
            .trim();
    }

    // ==================================================
    // FILE UPLOAD CHECK
    // ==================================================

    private isFileUploadKey(
        key: string
    ): boolean {

        const normalizedKey =
            this.normalizeText(key);

        return (
            normalizedKey.includes('upload') ||
            normalizedKey.includes('file') ||
            normalizedKey.includes('logo') ||
            normalizedKey.includes('document') ||
            normalizedKey.includes('attachment')
        );
    }

    // ==================================================
    // VALIDATE LOCATOR
    // ==================================================

    private async isUniqueAndVisible(
        locator: Locator,
        allowHiddenFileInput = false
    ): Promise<boolean> {

        try {

            const count =
                await locator.count();

            if (count !== 1) {
                return false;
            }

            if (
                await locator.isVisible()
            ) {
                return true;
            }

            // Hidden file inputs are valid upload targets.
            if (allowHiddenFileInput) {

                const type =
                    await locator.getAttribute(
                        'type'
                    );

                if (
                    type?.toLowerCase() === 'file'
                ) {

                    this.log(
                        'HIDDEN_FILE_INPUT_ACCEPTED'
                    );

                    return true;
                }
            }

            return false;

        } catch {

            return false;
        }
    }

    // ==================================================
    // SAFE ATTRIBUTE READER
    // ==================================================

    private async getAttributeValue(
        locator: Locator,
        attribute: string
    ): Promise<string> {

        try {

            return (
                await locator.getAttribute(
                    attribute
                )
            ) ?? '';

        } catch {

            return '';
        }
    }

    // ==================================================
    // SAFE TEXT READER
    // ==================================================

    private async getTextValue(
        locator: Locator
    ): Promise<string> {

        try {

            return (
                await locator.innerText()
            ).trim();

        } catch {

            try {

                return (
                    await locator.textContent()
                )?.trim() ?? '';

            } catch {

                return '';
            }
        }
    }

    // ==================================================
    // SCORE CANDIDATE
    // ==================================================

    private scoreCandidate(
        candidate: Candidate,
        normalizedKey: string,
        words: string[],
        isUploadSearch: boolean
    ): number {

        const normalizedId =
            this.normalizeText(candidate.id);

        const normalizedName =
            this.normalizeText(candidate.name);

        const normalizedPlaceholder =
            this.normalizeText(
                candidate.placeholder
            );

        const normalizedAriaLabel =
            this.normalizeText(
                candidate.ariaLabel
            );

        const normalizedTitle =
            this.normalizeText(
                candidate.title
            );

        const normalizedText =
            this.normalizeText(
                candidate.text
            );

        const normalizedTestId =
            this.normalizeText(
                candidate.testId
            );

        const normalizedAccept =
            this.normalizeText(
                candidate.accept
            );

        const normalizedAttributes =
            [
                normalizedId,
                normalizedName,
                this.normalizeText(
                    candidate.type
                ),
                normalizedPlaceholder,
                normalizedAriaLabel,
                normalizedTitle,
                normalizedTestId,
                normalizedAccept,
                normalizedText
            ]
                .join(' ')
                .trim();

        let score = 0;

        // ----------------------------------------------
        // EXACT MATCHES
        // ----------------------------------------------

        if (
            normalizedId === normalizedKey
        ) {
            score += 60;
        }

        if (
            normalizedName === normalizedKey
        ) {
            score += 55;
        }

        if (
            normalizedAriaLabel === normalizedKey
        ) {
            score += 50;
        }

        if (
            normalizedText === normalizedKey
        ) {
            score += 50;
        }

        if (
            normalizedAttributes.includes(
                normalizedKey
            )
        ) {
            score += 20;
        }

        // ----------------------------------------------
        // WORD MATCHING
        // ----------------------------------------------

        let matchedWords = 0;

        for (const word of words) {

            if (
                normalizedAttributes.includes(word)
            ) {

                matchedWords++;
                score += 5;
            }
        }

        if (
            words.length > 0 &&
            matchedWords === words.length
        ) {
            score += 20;
        }

        // ----------------------------------------------
        // EMAIL
        // ----------------------------------------------

        if (
            normalizedKey.includes('email') &&
            (
                candidate.type.toLowerCase() === 'email' ||
                normalizedId.includes('email') ||
                normalizedName.includes('email') ||
                normalizedPlaceholder.includes('email')
            )
        ) {

            score += 25;
        }

        // ----------------------------------------------
        // PASSWORD
        // ----------------------------------------------

        if (
            normalizedKey.includes('password') &&
            (
                candidate.type.toLowerCase() === 'password' ||
                normalizedId.includes('password') ||
                normalizedName.includes('password') ||
                normalizedPlaceholder.includes('password')
            )
        ) {

            score += 25;
        }

        // ----------------------------------------------
        // FILE UPLOAD
        // ----------------------------------------------

        if (
            isUploadSearch &&
            candidate.tag === 'input' &&
            candidate.type.toLowerCase() === 'file'
        ) {

            score += 50;

            if (
                normalizedKey.includes('logo') &&
                (
                    normalizedId.includes('logo') ||
                    normalizedName.includes('logo')
                )
            ) {

                score += 30;
            }

            if (
                normalizedKey.includes('upload') &&
                (
                    normalizedId.includes('upload') ||
                    normalizedName.includes('upload')
                )
            ) {

                score += 25;
            }
        }

        // ----------------------------------------------
        // ADMINISTRATION NAVIGATION
        // ----------------------------------------------

        if (
            normalizedKey.includes(
                'administration'
            ) &&
            (
                normalizedText.includes(
                    'administration'
                ) ||
                normalizedAriaLabel.includes(
                    'administration'
                ) ||
                normalizedTitle.includes(
                    'administration'
                )
            )
        ) {

            score += 50;
        }

        // ----------------------------------------------
        // PRODUCTS NAVIGATION
        // ----------------------------------------------

        if (
            normalizedKey.includes(
                'products'
            ) &&
            (
                normalizedText.includes(
                    'products'
                ) ||
                normalizedAriaLabel.includes(
                    'products'
                ) ||
                normalizedTitle.includes(
                    'products'
                )
            )
        ) {

            score += 50;
        }

        return score;
    }

    // ==================================================
    // DISCOVER CANDIDATES
    // No evaluateAll() is used here.
    // ==================================================

    private async discoverCandidates(
        key: string
    ): Promise<LocatorConfig[]> {

        const normalizedKey =
            this.normalizeText(key);

        const words =
            normalizedKey
                .split(/\s+/)
                .filter(
                    word => word.length > 1
                );

        const isUploadSearch =
            this.isFileUploadKey(key);

        this.log(
            `DISCOVERY_STARTED | ${key} | ` +
            `normalized=${normalizedKey}`
        );

        const selector =
            'input, button, textarea, select, a, ' +
            '[role], [data-testid]';

        const elements =
            this.page.locator(selector);

        const count =
            await elements.count();

        const candidates: Candidate[] = [];

        // Safety limit.
        const limit =
            Math.min(count, 300);

        for (
            let index = 0;
            index < limit;
            index++
        ) {

            const element =
                elements.nth(index);

            try {

                const tag =
                    await element.evaluate(
                        el =>
                            el.tagName.toLowerCase()
                    );

                const candidate: Candidate = {

                    tag,

                    id:
                        await this.getAttributeValue(
                            element,
                            'id'
                        ),

                    name:
                        await this.getAttributeValue(
                            element,
                            'name'
                        ),

                    type:
                        await this.getAttributeValue(
                            element,
                            'type'
                        ),

                    placeholder:
                        await this.getAttributeValue(
                            element,
                            'placeholder'
                        ),

                    ariaLabel:
                        await this.getAttributeValue(
                            element,
                            'aria-label'
                        ),

                    title:
                        await this.getAttributeValue(
                            element,
                            'title'
                        ),

                    text:
                        await this.getTextValue(
                            element
                        ),

                    testId:
                        await this.getAttributeValue(
                            element,
                            'data-testid'
                        ),

                    accept:
                        await this.getAttributeValue(
                            element,
                            'accept'
                        ),

                    score: 0
                };

                candidate.score =
                    this.scoreCandidate(
                        candidate,
                        normalizedKey,
                        words,
                        isUploadSearch
                    );

                if (
                    candidate.score > 0
                ) {

                    candidates.push(
                        candidate
                    );
                }

            } catch {

                // Ignore elements that disappear
                // while inspecting the DOM.
            }
        }

        const ranked =
            candidates.sort(
                (a, b) =>
                    b.score - a.score
            );

        this.log(
            `DISCOVERY_CANDIDATES | ${key} | ` +
            JSON.stringify(
                ranked.slice(0, 10)
            )
        );

        if (
            ranked.length === 0
        ) {

            return [];
        }

        const best =
            ranked[0];

        // Avoid selecting an ambiguous candidate.
        if (
            ranked.length > 1 &&
            best.score === ranked[1].score
        ) {

            this.log(
                `DISCOVERY_AMBIGUOUS | ${key} | ` +
                `topScore=${best.score}`
            );

            return [];
        }

        let config:
            | LocatorConfig
            | undefined;

        // ==================================================
        // LOCATOR PRIORITY
        // ==================================================

        if (
            best.testId
        ) {

            config = {
                type: 'testId',
                value: best.testId
            };

        } else if (
            best.id
        ) {

            config = {
                type: 'css',
                value: `#${best.id}`
            };

        } else if (
            best.name &&
            (
                best.tag === 'input' ||
                best.tag === 'textarea' ||
                best.tag === 'select'
            )
        ) {

            config = {
                type: 'css',
                value:
                    `${best.tag}[name="${best.name}"]`
            };

        } else if (
            best.placeholder
        ) {

            config = {
                type: 'placeholder',
                value: best.placeholder
            };

        } else if (
            best.ariaLabel &&
            best.tag === 'button'
        ) {

            config = {
                type: 'role',
                role: 'button',
                name: best.ariaLabel
            };

        } else if (
            best.ariaLabel &&
            best.tag === 'a'
        ) {

            config = {
                type: 'role',
                role: 'link',
                name: best.ariaLabel
            };

        } else if (
            best.text &&
            best.tag === 'button'
        ) {

            // IMPORTANT:
            // Use role instead of getByText().
            config = {
                type: 'role',
                role: 'button',
                name: best.text
            };

        } else if (
            best.text &&
            best.tag === 'a'
        ) {

            // IMPORTANT:
            // Use role instead of getByText().
            config = {
                type: 'role',
                role: 'link',
                name: best.text
            };

        } else if (
            best.text
        ) {

            config = {
                type: 'text',
                value: best.text
            };
        }

        if (
            config
        ) {

            this.log(
                `DISCOVERY_SELECTED | ${key} | ` +
                `score=${best.score} | ` +
                `${JSON.stringify(config)}`
            );

            return [config];
        }

        return [];
    }

    // ==================================================
    // MAIN SELF-HEALING METHOD
    // ==================================================

    async find(
        key: string,
        primary: LocatorConfig,
        fallbacks: LocatorConfig[] = []
    ): Promise<Locator> {

        this.log(
            `FIND_STARTED | ${key}`
        );

        const allowHiddenFileInput =
            this.isFileUploadKey(key);

        const cache =
            this.readCache();

        const cached =
            cache[key];

        // ==================================================
        // 1. TRY CACHED LOCATOR
        // ==================================================

        if (cached) {

            try {

                const cachedLocator =
                    this.createLocator(
                        cached
                    );

                if (
                    await this.isUniqueAndVisible(
                        cachedLocator,
                        allowHiddenFileInput
                    )
                ) {

                    this.log(
                        `CACHE_HIT | ${key} | ` +
                        `${JSON.stringify(cached)}`
                    );

                    return cachedLocator;
                }

                this.log(
                    `CACHE_STALE | ${key}`
                );

            } catch (error) {

                this.log(
                    `CACHE_ERROR | ${key} | ` +
                    `${String(error)}`
                );
            }
        }

        // ==================================================
        // 2. TRY PRIMARY LOCATOR
        // ==================================================

        try {

            const originalLocator =
                this.createLocator(
                    primary
                );

            if (
                await this.isUniqueAndVisible(
                    originalLocator,
                    allowHiddenFileInput
                )
            ) {

                // Save successful locator for future runs.
                this.saveCache(
                    key,
                    primary
                );

                this.log(
                    `ORIGINAL_OK | ${key}`
                );

                return originalLocator;
            }

            this.log(
                `ORIGINAL_FAILED | ${key} | ` +
                `${JSON.stringify(primary)}`
            );

        } catch (error) {

            this.log(
                `PRIMARY_ERROR | ${key} | ` +
                `${String(error)}`
            );
        }

        // ==================================================
        // 3. TRY FALLBACK LOCATORS
        // ==================================================

        for (
            const fallback of fallbacks
        ) {

            try {

                const fallbackLocator =
                    this.createLocator(
                        fallback
                    );

                if (
                    await this.isUniqueAndVisible(
                        fallbackLocator,
                        allowHiddenFileInput
                    )
                ) {

                    this.saveCache(
                        key,
                        fallback
                    );

                    this.log(
                        `HEALED_BY_FALLBACK | ${key} | ` +
                        `${JSON.stringify(fallback)}`
                    );

                    return fallbackLocator;
                }

            } catch (error) {

                this.log(
                    `FALLBACK_ERROR | ${key} | ` +
                    `${String(error)}`
                );
            }
        }

        // ==================================================
        // 4. DOM DISCOVERY
        // ==================================================

        const discovered =
            await this.discoverCandidates(
                key
            );

        for (
            const candidate of discovered
        ) {

            try {

                const discoveredLocator =
                    this.createLocator(
                        candidate
                    );

                if (
                    await this.isUniqueAndVisible(
                        discoveredLocator,
                        allowHiddenFileInput
                    )
                ) {

                    this.saveCache(
                        key,
                        candidate
                    );

                    this.log(
                        `HEALED_BY_DISCOVERY | ${key} | ` +
                        `${JSON.stringify(candidate)}`
                    );

                    return discoveredLocator;
                }

            } catch (error) {

                this.log(
                    `DISCOVERY_LOCATOR_ERROR | ${key} | ` +
                    `${String(error)}`
                );
            }
        }

        // ==================================================
        // 5. FAILED
        // ==================================================

        this.log(
            `HEALING_FAILED | ${key}`
        );

        throw new Error(
            `Self-healing failed for "${key}". ` +
            'No suitable unique locator could be identified safely.'
        );
    }
}