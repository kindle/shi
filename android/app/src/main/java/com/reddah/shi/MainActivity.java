package com.reddah.shi;

import android.os.Bundle;
import android.view.Window;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		hideSystemNavigationBars();
	}

	@Override
	public void onResume() {
		super.onResume();
		hideSystemNavigationBars();
	}

	@Override
	public void onWindowFocusChanged(boolean hasFocus) {
		super.onWindowFocusChanged(hasFocus);
		if (hasFocus) {
			hideSystemNavigationBars();
		}
	}

	private void hideSystemNavigationBars() {
		final Window window = getWindow();
		if (window == null) {
			return;
		}

		WindowCompat.setDecorFitsSystemWindows(window, false);

		final WindowInsetsControllerCompat controller =
			WindowCompat.getInsetsController(window, window.getDecorView());

		if (controller == null) {
			return;
		}

		controller.setSystemBarsBehavior(
			WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
		);
		controller.hide(WindowInsetsCompat.Type.navigationBars());
	}
}
