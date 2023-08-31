---
title: "Content Security Policy (CSP)"
tags: 
- Security
aliases:
- Implementing a Secure Content Security Policy (CSP)
---

<a href="#tldr">
<h3>
<span class="hanchor" arialabel="Anchor"># </span>
<code>Skip to TLDR;?</code>
</h3>
</a>

## Introduction

Content Security Policy (CSP) provides mechanisms for websites to restrict content that browsers will be allowed to load. It is the holy grail for client side web application security. A strong policy can provide monumental protection against threats such as Cross Site Scripting (XSS), Cross-Origin Resource Sharing (CORS), Click-jacking, HTTP Downgrade attacks and much more. This is because CSP employs the hardened security framework of the modern browser, baking it into the end users' web application.

<h3><strong><code>However,</code></strong></h3> 

the resilience of CSP is often compromised during web development due to numerous gaps introduced by developers to support certain libraries/inline scripts/quick integrations etc.
<br>

## Learning from Common Mistakes:
```yaml {title="Example of an insecure CSP"}
Content-Security-Policy: default-src 'self’ <source> *; 
frame-src http://3rdparty.site <source>; 
script-src *.google.com:80 <source> cdn.js unsafe-inline unsafe-eval;
```
[Not sure what frame-src or any other directives are ? - Click here](https://web.dev/csp/#policy-applies-to-a-wide-variety-of-resources)

### <code> Insecure default-src: </code><br>
This is the policy the browser must refer to in case there is no specific one mentioned i.e the default case.
Here although the scope of the default-src mentions 'self' (allowing only one's own website as the scope), the presence of '*' directs the browser to accept sources from anywhere. The use of such a broad scope can be very dangerous.

### <code> Lack of font-src, img-src, connect-src, media-src & more: </code><br>
These additional policies have not been mentioned hence default-src would be used. Making the job of tightening the security of default-src paramount. The above policies are used in case you wish to make an exception for a particular src such as img-src, but don’t want to weaken the security of the default/other configurations. 
### <code>Avoid 'unsafe-eval'/'unsafe-inline' </code><br>
Using these in any directive is a HUGE risk and must be avoided. Just their mere Instead move inline scripts into separate javascript files or use a [nonce/hash value](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html#hashes)
### <code> Defining your \<source\>: </code><br>
##### 1. Define strict scope even for reputed first party sites
- The use of *.google.com allows all of Google's [1120+ subdomains](https://gist.github.com/abuvanth/b9fcbaf7c77c2954f96c6e556138ffe8) to be used as a script source. You may still think of it as not a threat, but just to refresh your memory: Anyone can build a website on sites.google.com and it would fulfill the above regex requirements.
 
##### 2. Be sure about adding 3rd party websites to your CSP
- In case there is any vulnerability present in the 3rd party website, it could lead to an attack vector into your site as well.

##### 3. Always think twice when adding '*' to a CSP regex:
- The sources used in CSP must be precisely defined. Eg if you're accepting a legitimate javascript file from a CDN such as cdn.js, your source should not be cdn.js/* . This is problematic as many public cdn’s allow users to host their own javascript libraries. So an attacker could take advantage of the lax regex and call cdn.js/their-malicious.js. <br>


## Recommendation: 
If Content Security Policy is not already present - implement it immediately. Content Security Policy can be set either in the response header or in the html's meta tag, the prior being given a higher priority. <br>
```yaml {title="Example of a Secure CSP"}
Content-Security-Policy: default-src 'self’; 
frame-src 'self'; 
script-src 'self' https://cdn.jsdelivr.net/npm/@floating-ui/core@1.2.1;
frame-ancestors ‘none’;
report-to csp-error;
report-uri https://sumirbroota.com/csp-violations
upgrade-insecure-requests;
```

### <code>frame-ancestors ‘none’: </code>
This is a suitable setting in case one is not using an iframe in their sites functionality. frame-ancestors restricts the URLs that can embed the requested resource inside of \<frame\>, \<iframe\>, \<object\>, \<embed\>, or \<applet\> elements.
- If this directive is specified in a \<meta\> tag, the directive is ignored.
- This directive doesn't fallback to default-src directive.
- X-Frame-Options is rendered obsolete by this directive and is ignored by the user agents.

### <code>upgrade-insecure-requests: </code>
The following directive will ensure that all requests will be sent over HTTPS with no fallback to HTTP
### <code> report-to: </code>
Reporting directives delivers violations of prevented behaviors to specified locations. To ensure backwards compatibility report-uri is also used.
```yaml {title="Example Report-To header"}
Report-To: {"group":"csp-error","max_age":180000,"endpoints":[{"url":"https://sumirbroota.com/csp-violations"}],"include_subdomains":true}
```

>[!tldr]
>1. Be cautious of 3rd party urls & using '*' in even in trusted urls, if a direct url can be used, it would be best.
>2. Do not use 'unsafe-eval'/'unsafe-inline' instead use a [nonce or a hash value](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html#hashes).
>3. default-src directive defines the default policy for fetching resources hence make sure it is the most secure.
>4. Use other source directives if you wish to make an exception for a specific one but no weaken the security of the others/default
>5. Avoid using the 'data' scheme as it can be used as a vector for XSS.

## Language/Framework Specific Examples:
<br>

```yaml {title="For Apache use:"}
Header always set Content-Security-Policy "default-src 'self';"
```
in your /etc/apache2/sites-enabled/example.conf file. <br><br>

```yaml {title="For Nginx use:"}
add_header Content-Security-Policy: "default-src 'self’;"; always;
```
in your server {} block of the /etc/nginx/sites-enabled/example.conf file. Here the always; option specifies to send the CSP no matter the response code. <br><br>

Use tools such as [SeeSPee](https://github.com/papandreou/seespee) to create a Content-Security-Policy for a website based on the statically detectable relations. *Note you will still have to validate it yourself*
<br><br>

<section id="tldr"></section>

> [!quote] TLDR;
>
> Content Security Policy (CSP) provides mechanisms to websites to restrict content that browsers will be allowed to load e.g. inline scripts, remote javascript files. CSP can be set either in the response header or in the html’s meta tag, the prior being given a higher priority. <br>
> Recommendation: 
>1. Be cautious of 3rd party urls & using '*' in even in trusted urls, if a direct url can be used, it would be best.
>2. Do not use 'unsafe-eval'/'unsafe-inline' instead use a [nonce or a hash value](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html#hashes).
>3. default-src directive defines the default policy for fetching resources hence make sure it is the most secure.
>4. Use other source directives if you wish to make an exception for a specific one but no weaken the security of the others/default
>5. Avoid using the 'data' scheme as it can be used as a vector for xss.


## References: 
1. https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
2. https://www.invicti.com/web-vulnerability-scanner/vulnerabilities/content-security-policy-csp-not-implemented/
3. https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
4. https://content-security-policy.com/examples/nginx/
5. https://webdock.io/en/docs/how-guides/security-guides/how-to-configure-security-headers-in-nginx-and-apache