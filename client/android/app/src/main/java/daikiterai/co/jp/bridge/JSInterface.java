package daikiterai.co.jp.bridge;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.support.v4.content.LocalBroadcastManager;

/**
 * Created by teraidaiki on 2016/08/11.
 */
public class JSInterface {

    public WebView webView;
    private JavascriptCaller caller;

    @TargetApi(19)
    public JSInterface(Context context) {

        //レイアウトで指定したWebViewのIDを指定する。
        webView = new WebView(context);


        // localStorageを許可する
        webView.getSettings().setDomStorageEnabled(true);
        // javascriptを許可する
        webView.getSettings().setJavaScriptEnabled(true);


        // API 19以上
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            caller = new JavascriptCaller(context, webView);
            // Javascriptからよびだせるインタフェースを登録
            webView.addJavascriptInterface(caller, "Android");
            // デバッグ有効
            webView.setWebContentsDebuggingEnabled(true);
        }

        final Context ctx = context;

        //リンクをタップしたときに標準ブラウザを起動させない
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);

                // "MY_EVENT"という名前でIntentを送る
                Intent intent = new Intent("JSInterfaceLoaded");
                // 送信
                // NSNotificationCenter.defaultCenter().postNotificationName(...)の役割
                LocalBroadcastManager.getInstance(ctx).sendBroadcast(intent);

            }
        });


        webView.loadUrl("file:///android_asset/index.html");
    }


    public interface JavascriptResult{
        public void callback(String string);
    }


    public class JavascriptCaller {
        private Context context;
        private WebView webView;
        private JavascriptResult result;

        public JavascriptCaller(Context context, WebView webView) {
            this.context = context;
            this.webView = webView;
        }

        @JavascriptInterface
        public void callback(String string) {
            this.result.callback(string);
        }

        public void setResult(JavascriptResult result){
            this.result = result;
        }
    }

    // javascript実行
    public void call(String jscript,JavascriptResult result)
    {
        caller.setResult(result);
        webView.evaluateJavascript(jscript, null);
    }

}