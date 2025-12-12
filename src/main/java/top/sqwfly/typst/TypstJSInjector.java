package top.sqwfly.typst;

public class TypstJSInjector {
    static String getParsedTypstScript(String typstSelector) {
        String typstScript = """
            <script>
              function previewSvg(selector) {
                const els = document.body.querySelectorAll(selector);
                els.forEach((el) => {
                    const typstContent = el.getAttribute('data-content');
                    if (typstContent) {
                        $typst.svg({ mainContent: typstContent }).then(svg => {
                            el.innerHTML = svg;
                        });
                    }
                });
              }
              document.addEventListener("DOMContentLoaded", function() {
                  previewSvg("%s");
              });
            </script>
         """;
        return String.format(typstScript, typstSelector);
    }
}
