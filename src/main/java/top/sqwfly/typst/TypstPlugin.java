package top.sqwfly.typst;

import org.springframework.stereotype.Component;
import run.halo.app.plugin.BasePlugin;
import run.halo.app.plugin.PluginContext;

@Component
public class TypstPlugin extends BasePlugin {
    public TypstPlugin(PluginContext pluginContext) {
        super(pluginContext);
    }
}
