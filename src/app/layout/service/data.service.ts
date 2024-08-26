import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "@src/environments/environment";
import {Router} from "@angular/router";
import {Observable} from "rxjs";


@Injectable({
    providedIn: 'root',
})
export class DataService {

    constructor(private http: HttpClient, private router: Router) {
    }

    findUserByEmail(email: string): boolean {
        return true;
    }

    register(name: string, email: string) {

    }

    login(authCode: string, codeVerifier: string) {
        // const headers = new HttpHeaders({
        //     'Content-Type': 'application/x-www-form-urlencoded',
        // });
        //
        // const body = new URLSearchParams();
        // body.set('code', authCode);
        // body.set('code_verifier', codeVerifier);
        //
        // return this.http.post(
        //     `${environment.apiEndpoint}/auth/oauth2/code/google`,
        //     body.toString(),
        //     {headers}
        // );
    }

    logout() {
    }

    createFile(name: string, token: string, folder: number | null = null): Observable<any> {
        const url = `${environment.apiEndpoint}/api/files`
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        if (folder) {
            return this.http.post(url, {name: name, folder: {id: folder}}, {headers});
        } else {
            return this.http.post(url, {name: name}, {headers});
        }
    }

    createFolder(name: string, token: string, folder: number | null = null): Observable<any> {
        const url = `${environment.apiEndpoint}/api/folders`
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        if (folder) {
            return this.http.post(url, {name: name, parent: {id: folder}}, {headers});
        } else {
            return this.http.post(url, {name: name}, {headers});
        }
    }

    saveFileContent(id: number, content: string, name: string, token: string): Observable<any> {
        const url = `${environment.apiEndpoint}/api/files/${id}`
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        return this.http.put(url, {content: content, name: name}, {headers});
    }
}
