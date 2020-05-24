import Pupperteer from 'puppeteer';
export type Selector = {
    selector: string;
    type?: string;
    attr?: {
        name: string;
        filter?: string[];
    }[];
};
export class Crawler {
    /**
     * Crawl data from an website
     * @param url Url of website that need to be crawled
     * @param selectors Selector to query info in website
     */
    public async crawlWeb(url: string, selectors: Selector[]) {
        const browser = await Pupperteer.launch();
        const page = await browser.newPage();
        // Processing
        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
        /* Catching data*/
        let result = await page.evaluate((selectors: Selector[]) => {
            try {
                let data: any = {};
                selectors.forEach((sel) => {
                    let selData = $(`${sel.selector}`);
                    let tempProcess: HTMLElement[] = [];
                    selData.each((idx, val) => {
                        if (sel.type) {
                            if (val.tagName.toLowerCase() === sel.type) {
                                tempProcess.push(val);
                            }
                        } else {
                            tempProcess.push(val);
                        }
                    });
                    let outputDataForSelector: any[] = [];
                    tempProcess.forEach((ele) => {
                        if (!sel.attr) {
                            outputDataForSelector.push(ele.innerText);
                        } else {
                            let eleOut: any = {};
                            for (let attr of sel.attr) {
                                let outputAttr = ele.getAttribute(attr.name);
                                if (attr.filter.length > 0) {
                                    for (let filter of attr.filter) {
                                        if (outputAttr.includes(filter)) {
                                            eleOut[attr.name] = outputAttr;
                                            break;
                                        }
                                        if (eleOut[attr.name]) {
                                            break;
                                        }
                                    }
                                }
                            }
                            if (Object.keys(eleOut).length > 0) {
                                outputDataForSelector.push(eleOut);
                            }
                        }
                    });
                    data[sel.selector] = outputDataForSelector;
                });
                return data;
            } catch (err) {
                return false;
            }
        }, selectors);
        // Done
        await browser.close();
        return result;
    }
}
