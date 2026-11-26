{
  description = "Floral Cities Hugo theme: dev shell, linters and GitHub Pages build";

  inputs = {
    nixpkgs.url = "git+https://github.com/nixos/nixpkgs?shallow=1&ref=nixpkgs-unstable";
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      git-hooks,
    }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      formatter = forAllSystems (pkgs: pkgs.nixfmt);

      checks = forAllSystems (pkgs: {
        pre-commit-check = git-hooks.lib.${pkgs.stdenv.hostPlatform.system}.run {
          src = ./.;
          hooks = {
            nixfmt.enable = true;
            rumdl = {
              enable = true;
              name = "Markdown lint (rumdl)";
              entry = "${pkgs.rumdl}/bin/rumdl check";
              types = [ "markdown" ];
              pass_filenames = false;
            };
            reuse = {
              enable = true;
              name = "REUSE licence check";
              entry = "${pkgs.reuse}/bin/reuse lint";
              pass_filenames = false;
            };
            djlint = {
              enable = true;
              name = "Go template lint (djlint)";
              entry = "${pkgs.djlint}/bin/djlint --profile=golang --lint --ignore=H021";
              files = "\\.html$";
            };
          };
        };
      });

      devShells = forAllSystems (
        pkgs:
        let
          # The test site loads the theme through test-site/themes/floral-cities -> ../..
          # Scripts resolve the repo root themselves, so they work from any directory.
          withTestSite =
            name: body:
            pkgs.writeShellScriptBin name ''
              set -euo pipefail
              root="$(${pkgs.git}/bin/git rev-parse --show-toplevel)"
              site="$root"
              ${body}
            '';

          run-local-server = withTestSite "run-local-server" ''
            exec ${pkgs.hugo}/bin/hugo server -DF --noHTTPCache --disableFastRender \
              -s "$site" --baseURL http://localhost/ "$@"
          '';

          # Used by .github/workflows/deploy-pages.yml; pass -b <baseURL>
          build-github-pages = withTestSite "build-github-pages" ''
            exec ${pkgs.hugo}/bin/hugo -F --gc --minify -s "$site" -d "$site/output" "$@"
          '';

          pre-commit = self.checks.${pkgs.stdenv.hostPlatform.system}.pre-commit-check;
        in
        {
          default = pkgs.mkShellNoCC {
            packages = [
              pkgs.hugo
              pkgs.reuse
              pkgs.rumdl
              pkgs.djlint
              pkgs.nixfmt
              run-local-server
              build-github-pages
            ];
            shellHook = ''
              ${pre-commit.shellHook}
              echo "Floral Cities shell ready: run-local-server, build-github-pages"
            '';
          };
        }
      );
    };
}
