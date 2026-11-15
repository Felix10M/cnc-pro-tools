package ro.cncprotools.app;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.graphics.Color;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Button;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.webkit.WebSettings;

public class MainActivity extends Activity {
    private static final String HOME = "https://felix10m.github.io/cnc-pro-tools/";
    private WebView web;
    private LinearLayout offline;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout root = new FrameLayout(this);
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(7,24,39));
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("https".equals(uri.getScheme()) && "felix10m.github.io".equals(uri.getHost())
                    && uri.getPath() != null && uri.getPath().startsWith("/cnc-pro-tools/")) return false;
                if (!request.isForMainFrame()) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {}
                return true;
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) offline.setVisibility(View.VISIBLE);
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (url.startsWith(HOME)) offline.setVisibility(View.GONE);
            }
        });
        root.addView(web, new FrameLayout.LayoutParams(-1,-1));
        offline = new LinearLayout(this);
        offline.setOrientation(LinearLayout.VERTICAL);
        offline.setGravity(android.view.Gravity.CENTER);
        offline.setPadding(36,36,36,36);
        offline.setBackgroundColor(Color.rgb(7,24,39));
        TextView title = new TextView(this);
        title.setText("CNC Pro Tools");
        title.setTextColor(Color.WHITE);
        title.setTextSize(26);
        offline.addView(title);
        TextView explanation = new TextView(this);
        explanation.setText("Nu se poate încărca aplicația. Verifică internetul și încearcă din nou.\n\nUnable to connect. Check your internet connection and retry.");
        explanation.setTextColor(Color.WHITE);
        explanation.setTextSize(16);
        explanation.setPadding(0,25,0,25);
        offline.addView(explanation);
        Button retry = new Button(this);
        retry.setText("Reîncearcă / Retry");
        retry.setOnClickListener(v -> { offline.setVisibility(View.GONE); web.loadUrl(HOME); });
        offline.addView(retry);
        offline.setVisibility(View.GONE);
        root.addView(offline, new FrameLayout.LayoutParams(-1,-1));
        setContentView(root);
        web.loadUrl(HOME);
    }
    @Override public void onBackPressed() {
        if (offline.getVisibility() == View.VISIBLE) { offline.setVisibility(View.GONE); web.loadUrl(HOME); }
        else if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() { if (web != null) web.destroy(); super.onDestroy(); }
}
