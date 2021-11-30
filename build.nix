let
  pinnedNixpkgs = (import <nixpkgs> {}).fetchFromGitHub {
    owner = "NixOS";
    repo = "nixpkgs";
    rev = "6d1934ae67198fda888f01d1642d8bd3cbe14bbb";
    sha256 = "0vp8mmdlhzpbjr75n4rfr9d6f4zy860d2avrcj6kd30zwz6aywsz";
  };
  strawberry = (import <nixpkgs> {}).fetchFromGitHub {
    owner = "goffrie";
    repo = "strawberry";
    rev = "38775c1e5077764b8ea032e2f1ce186721ceb21f";
  };
in { pkgs ? import pinnedNixpkgs {} }:
let
  client = import ./client { inherit pkgs; };
  server = (import strawberry { inherit pkgs; }).server;
in
{
  inherit client server;
}
