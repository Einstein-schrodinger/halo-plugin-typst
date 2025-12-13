package top.sqwfly.typst;

import com.google.common.base.Throwables;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.ReactiveSettingFetcher;
import run.halo.app.theme.ReactiveSinglePageContentHandler;

@Component
@RequiredArgsConstructor
@Slf4j
public class DefaultSinglePageContentHandler implements ReactiveSinglePageContentHandler {
    private final ReactiveSettingFetcher reactiveSettingFetcher;

    private static void injectJS(SinglePageContentContext contentContext, String typstSelector) {
        String parsedTypstScript = TypstJSInjector.getParsedTypstScript(typstSelector);
        contentContext.setContent(contentContext.getContent() + "\n" + parsedTypstScript);
    }

    @Override
    public Mono<SinglePageContentContext> handle(SinglePageContentContext contentContext) {
        return reactiveSettingFetcher.fetch("basic", BasicConfig.class).map(basicConfig -> {
            injectJS(contentContext, basicConfig.getTypstSelector());
            return contentContext;
        }).onErrorResume(e -> {
            log.error("Typst PostContent handle failed", Throwables.getRootCause(e));
            return Mono.just(contentContext);
        });
    }
}
