package daikiterai.co.jp.bridge;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;

public class MainActivity extends AppCompatActivity {

    private JSInterface bridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        bridge = new JSInterface(this);
        setContentView(bridge.webView);

        LocalBroadcastManager.getInstance(this)
                .registerReceiver(mMessageReceiver, new IntentFilter("JSInterfaceLoaded"));

    }

    // 登録するレシーバー
    private BroadcastReceiver mMessageReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            bridge.call("androidBridge('lib.test({data:\"test1\"})')", new JSInterface.JavascriptResult() {
                @Override
                public void callback(String string) {
                    Log.d("data:",string);
                }
            });
            bridge.call("androidBridge('lib.test({data:\"test2\"})')", new JSInterface.JavascriptResult() {
                @Override
                public void callback(String string) {
                    Log.d("data:",string);
                }
            });

        }
    };

    @Override
    protected void onDestroy() {
        // レシーバーの削除
        LocalBroadcastManager.getInstance(this).unregisterReceiver(mMessageReceiver);
        super.onDestroy();
    }
}
