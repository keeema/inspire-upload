function http(url: string, success?: (result: string) => void, failure?: (status: number, statusText: string) => void) {
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.send(null);

    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            if (request.status === 200) {
                if (success) success(request.responseText);
            } else if (failure) {
                failure(request.status, request.statusText);
            }
        }
    };
}

function mockXhr() {
    /* tslint:disable */
    XMLHttpRequest = <any>XhrMock;
    /* tslint:enable */
    FormData = FormDataMock;
}

function resolveEnvironment(): void {
    if (window.location.href.toString().toLowerCase().indexOf("file://") >= 0) {
        mockXhr();
        return;
    }

    http(
        "api/check",
        (result: string) => {
            if (result !== "API OK") mockXhr();
        },
        () => {
            mockXhr();
        }
    );
}

class FormDataMock {
    data: { [key: string]: { data: Blob; additional: string | undefined } } = {};
    append(name: string, value: string | Blob): void;
    append(name: string, value: string): void;
    append(name: string, blobValue: Blob, filename?: string): void;
    append(name: string, value: any, filename?: string): void {
        if (value instanceof Blob) {
            this.data[name] = { data: value, additional: filename };
        } else {
            this.data[name] = { data: new Blob([value]), additional: undefined };
        }
    }
    //   this.data[key] = { data, additional };
    // }
    delete() {}

    get(key: string) {
        return this.data[key]!.data as File;
    }
    getAll() {
        return [];
    }
    has(key: string): boolean {
        return this.data[key] !== undefined;
    }
    set(name: string, value: string | Blob): void;
    set(name: string, value: string): void;
    set(name: string, blobValue: Blob, filename?: string): void;
    set(name: string, value: any, filename?: string): void {
        this.append(name, value, filename);
    }

    forEach(_callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void) {
        return;
    }
}

class XhrMock {
    readyState: number = 0;
    status: number = 0;
    upload: { onprogress: (e: ProgressEvent) => void } = { onprogress: () => {} };
    onload?: (e: Event) => void;

    private loaded: number = 0;
    private step: number = 2000000;
    private file?: File;
    private timeoutId?: number;

    open() {
        return;
    }

    setRequestHeader() {
        return;
    }

    send(formData: FormDataMock): void {
        this.file = (<FormDataMock>formData).data["file"]!.data as File;
        this.performStep();
    }

    abort() {
        if (this.timeoutId) window.clearTimeout(this.timeoutId);
    }

    private performStep(): void {
        this.timeoutId = window.setTimeout(() => {
            if (this.file && this.addStep() === this.file.size) {
                this.readyState = 4;
                this.status = 200;
                if (this.onload) this.onload(new Event("loaded"));
            } else {
                let e = <ProgressEvent>{
                    lengthComputable: true,
                    loaded: this.loaded,
                    total: this.file ? this.file.size : 0,
                };

                this.upload.onprogress(e);
                this.performStep();
            }
        }, 100);
    }

    private addStep(): number {
        let newValue = this.loaded + this.step;
        this.loaded = this.file && newValue > this.file.size ? this.file.size : newValue;
        return this.loaded;
    }
}
