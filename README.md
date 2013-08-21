schema.js
---------

This produces alternative url schema behaviors or fallback.

Usage
-----

Simply add `<script>` tag into your document's `<head>` tag.

    <script src="/static/js/schema.min.js"></script>

Now you can define your own schema or fallbacks by `register_schema` function.

    <script>
    register_schema('github', {
        'web': 'https://github.com/{host}{path}'
    });
    </script>
    <a href="github://comfuture/schema.js">schema.js</a>

Sample code above just replaces `github` schema url into valid web url.
You can define 'web', 'android' and 'ios' handler for now. Your 'android' and
'ios' handler works only if no any other application handles it.
You can also define url handler by function.

    <script>
    function fb_uri(url) {
        switch (url.host) {
            case 'feed':
                return 'https://m.facebook.com/home.php';
            case 'events':
                return 'https://m.facebook.com/events/';
            // and so on..
        }
    }

    register_schema('fb', {
        'ios': fb_url,
        'android': fb_url,
        'web': 'http://facebook.com'
    });
    </script>
    <a href="fb://events">See facebook events</a>
    <a href="fb://feed">See facebook news feed</a>

If facebook mobile application is installed in your ios or android device,
facebook native app handles `fb://` schema. If not, `fb_uri` function re-routes
to mobile web page urls.

Or just promote to install native application.

    <script>
    register_schema('fb', {
        'ios': 'http://itunes.apple.com/app/facebook/id284882215',
        'android': 'https://play.google.com/store/apps/details?id=com.facebook.katana'
    });
    </script>

Documentation
-------------

all string patterns like `{word}` replaces to url components. valid url
components are these:

    https://mail.google.com/mail/u/0/?shva=1#inbox

* `scheme`: `https`
* `host`: `mail.google.com`
* `path`: `/mail/u/0/`
* `query`: `{"shva": "1"}`
* `fragment`: `inbox`

query arguments are replaced first if exists.

    <script>
    register_schema('sms', {
        'web': 'mailto:?to=&subject={body}&body={body}'
    });
    </script>
    <a href="sms:+1-123-4567?body=Hello%20world!">send message</a>

Example above launches default email client alternatively in environment
that can not send sms message like desktop environment.
(most smartphone os handels `sms` scheme with default messaging application)

Handler function accepts a parameter that contains url component object.

    <script>
    register_schema('sms', {
        'web': function(url) {
            alert('Can not send sms to ' + url.host + '. [message:' + url.query.body + ']');
        }
    });
    </script>
