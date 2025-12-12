#!/usr/bin/env python3
"""
sdev Programming Language - Python Interpreter
A unique, expressive programming language

Usage:
    python sdev-interpreter.py [file.sdev]   # Run a file
    python sdev-interpreter.py               # Start REPL

Library Usage:
    from sdev_interpreter import execute, Lexer, Parser, Interpreter
    result = execute('speak("Hello")')
"""

import sys
import re
import math
import random
import json
from enum import Enum, auto
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Callable, Union
from abc import ABC, abstractmethod

# ============= Token Types =============

class TokenType(Enum):
    NUMBER = auto()
    STRING = auto()
    IDENTIFIER = auto()
    
    # Keywords
    FORGE = auto()
    CONJURE = auto()
    PONDER = auto()
    OTHERWISE = auto()
    CYCLE = auto()
    WITHIN = auto()
    YIELD = auto()
    YEET = auto()
    SKIP = auto()
    YEP = auto()
    NOPE = auto()
    VOID = auto()
    BE = auto()
    SUMMON = auto()
    
    # Operators
    PLUS = auto()
    MINUS = auto()
    STAR = auto()
    SLASH = auto()
    PERCENT = auto()
    CARET = auto()
    
    # Comparison
    EQUALS = auto()
    DIFFERS = auto()
    LESS = auto()
    MORE = auto()
    ATMOST = auto()
    ATLEAST = auto()
    
    # Logical
    ALSO = auto()
    EITHER = auto()
    ISNT = auto()
    
    # Delimiters
    LPAREN = auto()
    RPAREN = auto()
    LBRACKET = auto()
    RBRACKET = auto()
    COMMA = auto()
    ARROW = auto()
    PIPE = auto()
    DOUBLE_COLON = auto()
    DOUBLE_SEMI = auto()
    COLON = auto()
    DOT = auto()
    TILDE = auto()
    
    EOF = auto()

KEYWORDS = {
    'forge': TokenType.FORGE,
    'conjure': TokenType.CONJURE,
    'ponder': TokenType.PONDER,
    'otherwise': TokenType.OTHERWISE,
    'cycle': TokenType.CYCLE,
    'within': TokenType.WITHIN,
    'yield': TokenType.YIELD,
    'yeet': TokenType.YEET,
    'skip': TokenType.SKIP,
    'yep': TokenType.YEP,
    'nope': TokenType.NOPE,
    'void': TokenType.VOID,
    'be': TokenType.BE,
    'also': TokenType.ALSO,
    'either': TokenType.EITHER,
    'isnt': TokenType.ISNT,
    'equals': TokenType.EQUALS,
    'differs': TokenType.DIFFERS,
    'summon': TokenType.SUMMON,
}

# ============= Token =============

@dataclass
class Token:
    type: TokenType
    value: str
    line: int
    column: int

# ============= Errors =============

class SdevError(Exception):
    def __init__(self, message: str, line: int = 0, column: int = 0):
        self.line = line
        self.column = column
        super().__init__(f"[Line {line}] {message}")

class ReturnException(Exception):
    def __init__(self, value: Any):
        self.value = value

class BreakException(Exception):
    pass

class ContinueException(Exception):
    pass

# ============= Lexer =============

class Lexer:
    def __init__(self, source: str):
        self.source = source
        self.pos = 0
        self.line = 1
        self.column = 1
        self.tokens: List[Token] = []
    
    def tokenize(self) -> List[Token]:
        while not self.is_at_end():
            self.scan_token()
        self.tokens.append(Token(TokenType.EOF, '', self.line, self.column))
        return self.tokens
    
    def scan_token(self):
        self.skip_whitespace()
        if self.is_at_end():
            return
        
        start_column = self.column
        char = self.advance()
        
        # Single character tokens
        single_tokens = {
            '(': TokenType.LPAREN,
            ')': TokenType.RPAREN,
            '[': TokenType.LBRACKET,
            ']': TokenType.RBRACKET,
            ',': TokenType.COMMA,
            '.': TokenType.DOT,
            '+': TokenType.PLUS,
            '*': TokenType.STAR,
            '%': TokenType.PERCENT,
            '^': TokenType.CARET,
            '~': TokenType.TILDE,
        }
        
        if char in single_tokens:
            self.add_token(single_tokens[char], char, start_column)
            return
        
        # Two character tokens
        if char == '-':
            if self.peek() == '>':
                self.advance()
                self.add_token(TokenType.ARROW, '->', start_column)
            else:
                self.add_token(TokenType.MINUS, char, start_column)
            return
        
        if char == '|':
            if self.peek() == '>':
                self.advance()
                self.add_token(TokenType.PIPE, '|>', start_column)
            else:
                raise SdevError(f"Unexpected character: '{char}'", self.line, start_column)
            return
        
        if char == ':':
            if self.peek() == ':':
                self.advance()
                self.add_token(TokenType.DOUBLE_COLON, '::', start_column)
            else:
                self.add_token(TokenType.COLON, ':', start_column)
            return
        
        if char == ';':
            if self.peek() == ';':
                self.advance()
                self.add_token(TokenType.DOUBLE_SEMI, ';;', start_column)
            return
        
        if char == '/':
            if self.peek() == '/':
                while not self.is_at_end() and self.peek() != '\n':
                    self.advance()
                return
            self.add_token(TokenType.SLASH, char, start_column)
            return
        
        if char == '<':
            if self.peek() == '>':
                self.advance()
                self.add_token(TokenType.DIFFERS, '<>', start_column)
            elif self.peek() == '=':
                self.advance()
                self.add_token(TokenType.ATMOST, '<=', start_column)
            else:
                self.add_token(TokenType.LESS, '<', start_column)
            return
        
        if char == '>':
            if self.peek() == '=':
                self.advance()
                self.add_token(TokenType.ATLEAST, '>=', start_column)
            else:
                self.add_token(TokenType.MORE, '>', start_column)
            return
        
        # String literals
        if char in '"\'`':
            self.scan_string(char, start_column)
            return
        
        # Numbers
        if char.isdigit():
            self.scan_number(char, start_column)
            return
        
        # Identifiers and keywords
        if char.isalpha() or char == '_':
            self.scan_identifier(char, start_column)
            return
        
        raise SdevError(f"Unexpected character: '{char}'", self.line, start_column)
    
    def scan_string(self, quote: str, start_column: int):
        value = ''
        while not self.is_at_end() and self.peek() != quote:
            if self.peek() == '\n':
                if quote == '`':
                    value += self.advance()
                    self.line += 1
                    self.column = 1
                    continue
                raise SdevError('Unterminated string', self.line, start_column)
            if self.peek() == '\\':
                self.advance()
                escaped = self.advance()
                escapes = {'n': '\n', 't': '\t', 'r': '\r', '\\': '\\', '"': '"', "'": "'", '`': '`'}
                value += escapes.get(escaped, escaped)
            else:
                value += self.advance()
        if self.is_at_end():
            raise SdevError('Unterminated string', self.line, start_column)
        self.advance()  # closing quote
        self.add_token(TokenType.STRING, value, start_column)
    
    def scan_number(self, first: str, start_column: int):
        value = first
        while self.peek().isdigit():
            value += self.advance()
        if self.peek() == '.' and self.peek_next().isdigit():
            value += self.advance()
            while self.peek().isdigit():
                value += self.advance()
        self.add_token(TokenType.NUMBER, value, start_column)
    
    def scan_identifier(self, first: str, start_column: int):
        value = first
        while self.peek().isalnum() or self.peek() == '_':
            value += self.advance()
        token_type = KEYWORDS.get(value, TokenType.IDENTIFIER)
        self.add_token(token_type, value, start_column)
    
    def skip_whitespace(self):
        while not self.is_at_end():
            char = self.peek()
            if char in ' \t\r':
                self.advance()
            elif char == '\n':
                self.line += 1
                self.column = 0
                self.advance()
            else:
                break
    
    def is_at_end(self) -> bool:
        return self.pos >= len(self.source)
    
    def peek(self) -> str:
        return self.source[self.pos] if self.pos < len(self.source) else '\0'
    
    def peek_next(self) -> str:
        return self.source[self.pos + 1] if self.pos + 1 < len(self.source) else '\0'
    
    def advance(self) -> str:
        char = self.source[self.pos]
        self.pos += 1
        self.column += 1
        return char
    
    def add_token(self, token_type: TokenType, value: str, column: int):
        self.tokens.append(Token(token_type, value, self.line, column))

# ============= AST Nodes =============

@dataclass
class ASTNode:
    line: int

@dataclass
class NumberLiteral(ASTNode):
    value: float

@dataclass
class StringLiteral(ASTNode):
    value: str

@dataclass
class BooleanLiteral(ASTNode):
    value: bool

@dataclass
class NullLiteral(ASTNode):
    pass

@dataclass
class Identifier(ASTNode):
    name: str

@dataclass
class BinaryExpr(ASTNode):
    operator: str
    left: ASTNode
    right: ASTNode

@dataclass
class UnaryExpr(ASTNode):
    operator: str
    operand: ASTNode

@dataclass
class CallExpr(ASTNode):
    callee: ASTNode
    args: List[ASTNode]

@dataclass
class IndexExpr(ASTNode):
    obj: ASTNode
    index: ASTNode

@dataclass
class MemberExpr(ASTNode):
    obj: ASTNode
    property: str

@dataclass
class ArrayLiteral(ASTNode):
    elements: List[ASTNode]

@dataclass
class DictLiteral(ASTNode):
    entries: List[tuple]

@dataclass
class LambdaExpr(ASTNode):
    params: List[str]
    body: ASTNode

@dataclass
class LetStatement(ASTNode):
    name: str
    value: ASTNode

@dataclass
class AssignStatement(ASTNode):
    name: str
    value: ASTNode

@dataclass
class IndexAssignStatement(ASTNode):
    obj: ASTNode
    index: ASTNode
    value: ASTNode

@dataclass
class IfStatement(ASTNode):
    condition: ASTNode
    then_branch: 'BlockStatement'
    else_branch: Optional[Union['BlockStatement', 'IfStatement']] = None

@dataclass
class WhileStatement(ASTNode):
    condition: ASTNode
    body: 'BlockStatement'

@dataclass
class ForInStatement(ASTNode):
    var_name: str
    iterable: ASTNode
    body: 'BlockStatement'

@dataclass
class FuncDeclaration(ASTNode):
    name: str
    params: List[str]
    body: 'BlockStatement'

@dataclass
class ReturnStatement(ASTNode):
    value: Optional[ASTNode] = None

@dataclass
class BreakStatement(ASTNode):
    pass

@dataclass
class ContinueStatement(ASTNode):
    pass

@dataclass
class BlockStatement(ASTNode):
    statements: List[ASTNode]

@dataclass
class ExpressionStatement(ASTNode):
    expression: ASTNode

@dataclass
class Program(ASTNode):
    statements: List[ASTNode]

# ============= Parser =============

class Parser:
    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.pos = 0
    
    def parse(self) -> Program:
        statements = []
        while not self.is_at_end():
            statements.append(self.parse_statement())
        return Program(1, statements)
    
    def parse_statement(self) -> ASTNode:
        if self.check(TokenType.FORGE):
            return self.parse_forge_statement()
        if self.check(TokenType.CONJURE):
            return self.parse_conjure_declaration()
        if self.check(TokenType.PONDER):
            return self.parse_ponder_statement()
        if self.check(TokenType.CYCLE):
            return self.parse_cycle_statement()
        if self.check(TokenType.WITHIN):
            return self.parse_within_statement()
        if self.check(TokenType.YIELD):
            return self.parse_yield_statement()
        if self.check(TokenType.YEET):
            return self.parse_break_statement()
        if self.check(TokenType.SKIP):
            return self.parse_continue_statement()
        if self.check(TokenType.DOUBLE_COLON):
            return self.parse_block_statement()
        return self.parse_expression_statement()
    
    def parse_forge_statement(self) -> LetStatement:
        forge_token = self.consume(TokenType.FORGE, "Expected 'forge'")
        name = self.consume(TokenType.IDENTIFIER, "Expected variable name").value
        self.consume(TokenType.BE, "Expected 'be'")
        value = self.parse_expression()
        return LetStatement(forge_token.line, name, value)
    
    def parse_conjure_declaration(self) -> FuncDeclaration:
        conjure_token = self.consume(TokenType.CONJURE, "Expected 'conjure'")
        name = self.consume(TokenType.IDENTIFIER, "Expected function name").value
        self.consume(TokenType.LPAREN, "Expected '('")
        
        params = []
        if not self.check(TokenType.RPAREN):
            params.append(self.consume(TokenType.IDENTIFIER, "Expected parameter name").value)
            while self.match(TokenType.COMMA):
                params.append(self.consume(TokenType.IDENTIFIER, "Expected parameter name").value)
        self.consume(TokenType.RPAREN, "Expected ')'")
        
        body = self.parse_block_statement()
        return FuncDeclaration(conjure_token.line, name, params, body)
    
    def parse_ponder_statement(self) -> IfStatement:
        ponder_token = self.consume(TokenType.PONDER, "Expected 'ponder'")
        condition = self.parse_expression()
        then_branch = self.parse_block_statement()
        
        else_branch = None
        if self.match(TokenType.OTHERWISE):
            if self.check(TokenType.PONDER):
                else_branch = self.parse_ponder_statement()
            else:
                else_branch = self.parse_block_statement()
        
        return IfStatement(ponder_token.line, condition, then_branch, else_branch)
    
    def parse_cycle_statement(self) -> WhileStatement:
        cycle_token = self.consume(TokenType.CYCLE, "Expected 'cycle'")
        condition = self.parse_expression()
        body = self.parse_block_statement()
        return WhileStatement(cycle_token.line, condition, body)
    
    def parse_within_statement(self) -> ForInStatement:
        within_token = self.consume(TokenType.WITHIN, "Expected 'within'")
        var_name = self.consume(TokenType.IDENTIFIER, "Expected variable name").value
        self.consume(TokenType.BE, "Expected 'be'") 
        iterable = self.parse_expression()
        body = self.parse_block_statement()
        return ForInStatement(within_token.line, var_name, iterable, body)
    
    def parse_yield_statement(self) -> ReturnStatement:
        yield_token = self.consume(TokenType.YIELD, "Expected 'yield'")
        value = None
        if not self.check(TokenType.DOUBLE_SEMI) and not self.is_at_end():
            if not self.check(TokenType.FORGE) and not self.check(TokenType.CONJURE) and \
               not self.check(TokenType.PONDER) and not self.check(TokenType.CYCLE):
                value = self.parse_expression()
        return ReturnStatement(yield_token.line, value)
    
    def parse_break_statement(self) -> BreakStatement:
        yeet_token = self.consume(TokenType.YEET, "Expected 'yeet'")
        return BreakStatement(yeet_token.line)
    
    def parse_continue_statement(self) -> ContinueStatement:
        skip_token = self.consume(TokenType.SKIP, "Expected 'skip'")
        return ContinueStatement(skip_token.line)
    
    def parse_block_statement(self) -> BlockStatement:
        colon_token = self.consume(TokenType.DOUBLE_COLON, "Expected '::'")
        statements = []
        while not self.check(TokenType.DOUBLE_SEMI) and not self.is_at_end():
            statements.append(self.parse_statement())
        self.consume(TokenType.DOUBLE_SEMI, "Expected ';;'")
        return BlockStatement(colon_token.line, statements)
    
    def parse_expression_statement(self) -> ASTNode:
        expr = self.parse_expression()
        
        if self.match(TokenType.BE):
            value = self.parse_expression()
            
            if isinstance(expr, Identifier):
                return AssignStatement(expr.line, expr.name, value)
            if isinstance(expr, IndexExpr):
                return IndexAssignStatement(expr.line, expr.obj, expr.index, value)
            raise SdevError('Invalid assignment target', expr.line)
        
        return ExpressionStatement(expr.line, expr)
    
    def parse_expression(self) -> ASTNode:
        return self.parse_pipe()
    
    def parse_pipe(self) -> ASTNode:
        left = self.parse_or()
        
        while self.match(TokenType.PIPE):
            right = self.parse_or()
            if isinstance(right, CallExpr):
                right.args.insert(0, left)
                left = right
            elif isinstance(right, Identifier):
                left = CallExpr(left.line, right, [left])
            else:
                raise SdevError('Pipe target must be a function or call', right.line)
        
        return left
    
    def parse_or(self) -> ASTNode:
        left = self.parse_and()
        while self.match(TokenType.EITHER):
            right = self.parse_and()
            left = BinaryExpr(left.line, 'either', left, right)
        return left
    
    def parse_and(self) -> ASTNode:
        left = self.parse_equality()
        while self.match(TokenType.ALSO):
            right = self.parse_equality()
            left = BinaryExpr(left.line, 'also', left, right)
        return left
    
    def parse_equality(self) -> ASTNode:
        left = self.parse_comparison()
        while self.match(TokenType.EQUALS, TokenType.DIFFERS):
            operator = 'equals' if self.previous().type == TokenType.EQUALS else 'differs'
            right = self.parse_comparison()
            left = BinaryExpr(left.line, operator, left, right)
        return left
    
    def parse_comparison(self) -> ASTNode:
        left = self.parse_term()
        while self.match(TokenType.LESS, TokenType.MORE, TokenType.ATMOST, TokenType.ATLEAST):
            operator = self.previous().value
            right = self.parse_term()
            left = BinaryExpr(left.line, operator, left, right)
        return left
    
    def parse_term(self) -> ASTNode:
        left = self.parse_factor()
        while self.match(TokenType.PLUS, TokenType.MINUS):
            operator = self.previous().value
            right = self.parse_factor()
            left = BinaryExpr(left.line, operator, left, right)
        return left
    
    def parse_factor(self) -> ASTNode:
        left = self.parse_power()
        while self.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT):
            operator = self.previous().value
            right = self.parse_power()
            left = BinaryExpr(left.line, operator, left, right)
        return left
    
    def parse_power(self) -> ASTNode:
        left = self.parse_unary()
        while self.match(TokenType.CARET):
            right = self.parse_unary()
            left = BinaryExpr(left.line, '^', left, right)
        return left
    
    def parse_unary(self) -> ASTNode:
        if self.match(TokenType.MINUS, TokenType.ISNT):
            operator = self.previous().value
            operand = self.parse_unary()
            return UnaryExpr(self.previous().line, operator, operand)
        return self.parse_call()
    
    def parse_call(self) -> ASTNode:
        expr = self.parse_primary()
        
        while True:
            if self.match(TokenType.LPAREN):
                expr = self.finish_call(expr)
            elif self.match(TokenType.LBRACKET):
                index = self.parse_expression()
                self.consume(TokenType.RBRACKET, "Expected ']'")
                expr = IndexExpr(expr.line, expr, index)
            elif self.match(TokenType.DOT):
                prop = self.consume(TokenType.IDENTIFIER, "Expected property name").value
                expr = MemberExpr(expr.line, expr, prop)
            elif self.match(TokenType.ARROW):
                if isinstance(expr, Identifier):
                    body = self.parse_expression()
                    expr = LambdaExpr(expr.line, [expr.name], body)
                else:
                    raise SdevError('Invalid lambda syntax', expr.line)
            else:
                break
        
        return expr
    
    def finish_call(self, callee: ASTNode) -> CallExpr:
        args = []
        if not self.check(TokenType.RPAREN):
            args.append(self.parse_expression())
            while self.match(TokenType.COMMA):
                args.append(self.parse_expression())
        self.consume(TokenType.RPAREN, "Expected ')'")
        return CallExpr(callee.line, callee, args)
    
    def parse_primary(self) -> ASTNode:
        token = self.peek()
        
        if self.match(TokenType.NUMBER):
            return NumberLiteral(token.line, float(token.value))
        
        if self.match(TokenType.STRING):
            return StringLiteral(token.line, token.value)
        
        if self.match(TokenType.YEP):
            return BooleanLiteral(token.line, True)
        
        if self.match(TokenType.NOPE):
            return BooleanLiteral(token.line, False)
        
        if self.match(TokenType.VOID):
            return NullLiteral(token.line)
        
        if self.match(TokenType.IDENTIFIER):
            return Identifier(token.line, token.value)
        
        if self.match(TokenType.LPAREN):
            exprs = []
            names = []
            is_lambda_params = True
            
            if not self.check(TokenType.RPAREN):
                expr = self.parse_expression()
                exprs.append(expr)
                if not isinstance(expr, Identifier):
                    is_lambda_params = False
                else:
                    names.append(expr.name)
                
                while self.match(TokenType.COMMA):
                    expr = self.parse_expression()
                    exprs.append(expr)
                    if not isinstance(expr, Identifier):
                        is_lambda_params = False
                    elif is_lambda_params:
                        names.append(expr.name)
            
            self.consume(TokenType.RPAREN, "Expected ')'")
            
            if self.match(TokenType.ARROW):
                if not is_lambda_params:
                    raise SdevError('Invalid lambda parameters', token.line)
                body = self.parse_expression()
                return LambdaExpr(token.line, names, body)
            
            if len(exprs) == 1:
                return exprs[0]
            raise SdevError('Unexpected multiple expressions', token.line)
        
        if self.match(TokenType.LBRACKET):
            return self.parse_array_literal(token.line)
        
        if self.match(TokenType.DOUBLE_COLON):
            return self.parse_dict_literal(token.line)
        
        raise SdevError(f"Unexpected token: '{token.value}'", token.line, token.column)
    
    def parse_array_literal(self, line: int) -> ArrayLiteral:
        elements = []
        if not self.check(TokenType.RBRACKET):
            elements.append(self.parse_expression())
            while self.match(TokenType.COMMA):
                elements.append(self.parse_expression())
        self.consume(TokenType.RBRACKET, "Expected ']'")
        return ArrayLiteral(line, elements)
    
    def parse_dict_literal(self, line: int) -> DictLiteral:
        entries = []
        if not self.check(TokenType.DOUBLE_SEMI):
            key = self.parse_expression()
            self.consume(TokenType.COLON, "Expected ':'")
            value = self.parse_expression()
            entries.append((key, value))
            while self.match(TokenType.COMMA):
                key = self.parse_expression()
                self.consume(TokenType.COLON, "Expected ':'")
                value = self.parse_expression()
                entries.append((key, value))
        self.consume(TokenType.DOUBLE_SEMI, "Expected ';;'")
        return DictLiteral(line, entries)
    
    # Helper methods
    def peek(self) -> Token:
        return self.tokens[self.pos]
    
    def previous(self) -> Token:
        return self.tokens[self.pos - 1]
    
    def is_at_end(self) -> bool:
        return self.peek().type == TokenType.EOF
    
    def check(self, token_type: TokenType) -> bool:
        return not self.is_at_end() and self.peek().type == token_type
    
    def match(self, *types: TokenType) -> bool:
        for t in types:
            if self.check(t):
                self.advance()
                return True
        return False
    
    def advance(self) -> Token:
        if not self.is_at_end():
            self.pos += 1
        return self.previous()
    
    def consume(self, token_type: TokenType, message: str) -> Token:
        if self.check(token_type):
            return self.advance()
        raise SdevError(message, self.peek().line, self.peek().column)

# ============= Environment =============

class Environment:
    def __init__(self, parent: Optional['Environment'] = None):
        self.values: Dict[str, Any] = {}
        self.parent = parent
    
    def define(self, name: str, value: Any):
        self.values[name] = value
    
    def get(self, name: str, line: int = 0) -> Any:
        if name in self.values:
            return self.values[name]
        if self.parent:
            return self.parent.get(name, line)
        raise SdevError(f"Undefined variable: '{name}'", line)
    
    def set(self, name: str, value: Any, line: int = 0):
        if name in self.values:
            self.values[name] = value
            return
        if self.parent:
            self.parent.set(name, value, line)
            return
        raise SdevError(f"Undefined variable: '{name}'", line)

# ============= Functions =============

@dataclass
class SdevBuiltin:
    name: str
    func: Callable

@dataclass
class SdevUserFunc:
    name: str
    params: List[str]
    body: BlockStatement
    closure: Environment

@dataclass
class SdevLambda:
    params: List[str]
    body: ASTNode
    closure: Environment

# ============= Interpreter =============

class Interpreter:
    def __init__(self, output_callback: Callable[[str], None] = print):
        self.output = output_callback
        self.global_env = Environment()
        self._register_builtins()
    
    def _register_builtins(self):
        builtins = self._create_builtins()
        for name, func in builtins.items():
            self.global_env.define(name, SdevBuiltin(name, func))
    
    def _create_builtins(self) -> Dict[str, Callable]:
        def stringify(value: Any) -> str:
            if value is None:
                return 'void'
            if isinstance(value, bool):
                return 'yep' if value else 'nope'
            if isinstance(value, (SdevBuiltin, SdevUserFunc, SdevLambda)):
                return '<conjuration>'
            if isinstance(value, list):
                return '[' + ', '.join(stringify(v) for v in value) + ']'
            if isinstance(value, dict):
                entries = ', '.join(f'{k}: {stringify(v)}' for k, v in value.items())
                return ':: ' + entries + ' ;;'
            return str(value)
        
        def is_truthy(value: Any) -> bool:
            if value is None:
                return False
            if isinstance(value, bool):
                return value
            if isinstance(value, (int, float)):
                return value != 0
            if isinstance(value, str):
                return len(value) > 0
            if isinstance(value, list):
                return len(value) > 0
            return True
        
        builtins = {}
        
        # Output
        def speak(args, line):
            msg = ' '.join(stringify(a) for a in args)
            self.output(msg)
            return None
        builtins['speak'] = speak
        
        def whisper(args, line):
            msg = ''.join(stringify(a) for a in args)
            self.output(msg)
            return None
        builtins['whisper'] = whisper
        
        def shout(args, line):
            msg = ' '.join(stringify(a) for a in args).upper()
            self.output(msg)
            return None
        builtins['shout'] = shout
        
        # Collections
        def measure(args, line):
            if len(args) != 1:
                raise SdevError('measure() takes exactly 1 argument', line)
            arg = args[0]
            if isinstance(arg, (str, list)):
                return len(arg)
            if isinstance(arg, dict):
                return len(arg)
            raise SdevError('measure() argument must be string, list, or dict', line)
        builtins['measure'] = measure
        
        def sequence(args, line):
            if len(args) < 1 or len(args) > 3:
                raise SdevError('sequence() takes 1 to 3 arguments', line)
            if len(args) == 1:
                return list(range(int(args[0])))
            elif len(args) == 2:
                return list(range(int(args[0]), int(args[1])))
            else:
                return list(range(int(args[0]), int(args[1]), int(args[2])))
        builtins['sequence'] = sequence
        
        def gather(args, line):
            if len(args) != 2:
                raise SdevError('gather() takes 2 arguments', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            arr.append(args[1])
            return arr
        builtins['gather'] = gather
        
        def pluck(args, line):
            if len(args) != 1:
                raise SdevError('pluck() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            if len(arr) == 0:
                raise SdevError('Cannot pluck from empty list', line)
            return arr.pop()
        builtins['pluck'] = pluck
        
        def portion(args, line):
            if len(args) < 2 or len(args) > 3:
                raise SdevError('portion() takes 2 or 3 arguments', line)
            arr = args[0]
            if not isinstance(arr, (list, str)):
                raise SdevError('First argument must be a list or string', line)
            start = int(args[1])
            end = int(args[2]) if len(args) == 3 else None
            return arr[start:end]
        builtins['portion'] = portion
        
        def weave(args, line):
            if len(args) != 2:
                raise SdevError('weave() takes 2 arguments', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            sep = args[1]
            if not isinstance(sep, str):
                raise SdevError('Second argument must be a string', line)
            return sep.join(stringify(x) for x in arr)
        builtins['weave'] = weave
        
        def shatter(args, line):
            if len(args) != 2:
                raise SdevError('shatter() takes 2 arguments', line)
            s = args[0]
            if not isinstance(s, str):
                raise SdevError('First argument must be a string', line)
            sep = args[1]
            if not isinstance(sep, str):
                raise SdevError('Second argument must be a string', line)
            return s.split(sep)
        builtins['shatter'] = shatter
        
        # Type utilities
        def morph(args, line):
            if len(args) != 2:
                raise SdevError('morph() takes 2 arguments (value, type)', line)
            val = args[0]
            target = args[1]
            if target == 'number':
                if isinstance(val, (int, float)):
                    return val
                if isinstance(val, str):
                    try:
                        return float(val)
                    except:
                        raise SdevError(f"Cannot morph '{val}' to number", line)
                raise SdevError('Cannot morph to number', line)
            elif target == 'text':
                return stringify(val)
            elif target == 'truth':
                return is_truthy(val)
            else:
                raise SdevError(f"Unknown type: {target}", line)
        builtins['morph'] = morph
        
        def essence(args, line):
            if len(args) != 1:
                raise SdevError('essence() takes 1 argument', line)
            val = args[0]
            if val is None:
                return 'void'
            if isinstance(val, (int, float)):
                return 'number'
            if isinstance(val, str):
                return 'text'
            if isinstance(val, bool):
                return 'truth'
            if isinstance(val, list):
                return 'list'
            if isinstance(val, dict):
                return 'tome'
            if isinstance(val, (SdevBuiltin, SdevUserFunc, SdevLambda)):
                return 'conjuration'
            return 'mystery'
        builtins['essence'] = essence
        
        # Math
        def magnitude(args, line):
            if len(args) != 1:
                raise SdevError('magnitude() takes 1 argument', line)
            return abs(args[0])
        builtins['magnitude'] = magnitude
        
        def least(args, line):
            if len(args) == 0:
                raise SdevError('least() takes at least 1 argument', line)
            if len(args) == 1 and isinstance(args[0], list):
                return min(args[0])
            return min(args)
        builtins['least'] = least
        
        def greatest(args, line):
            if len(args) == 0:
                raise SdevError('greatest() takes at least 1 argument', line)
            if len(args) == 1 and isinstance(args[0], list):
                return max(args[0])
            return max(args)
        builtins['greatest'] = greatest
        
        def root(args, line):
            if len(args) != 1:
                raise SdevError('root() takes 1 argument', line)
            return math.sqrt(args[0])
        builtins['root'] = root
        
        def ground(args, line):
            if len(args) != 1:
                raise SdevError('ground() takes 1 argument', line)
            return math.floor(args[0])
        builtins['ground'] = ground
        
        def elevate(args, line):
            if len(args) != 1:
                raise SdevError('elevate() takes 1 argument', line)
            return math.ceil(args[0])
        builtins['elevate'] = elevate
        
        def nearby(args, line):
            if len(args) != 1:
                raise SdevError('nearby() takes 1 argument', line)
            return round(args[0])
        builtins['nearby'] = nearby
        
        def chaos(args, line):
            return random.random()
        builtins['chaos'] = chaos
        
        # String operations
        def upper(args, line):
            if len(args) != 1:
                raise SdevError('upper() takes 1 argument', line)
            if not isinstance(args[0], str):
                raise SdevError('Argument must be text', line)
            return args[0].upper()
        builtins['upper'] = upper
        
        def lower(args, line):
            if len(args) != 1:
                raise SdevError('lower() takes 1 argument', line)
            if not isinstance(args[0], str):
                raise SdevError('Argument must be text', line)
            return args[0].lower()
        builtins['lower'] = lower
        
        def trim(args, line):
            if len(args) != 1:
                raise SdevError('trim() takes 1 argument', line)
            if not isinstance(args[0], str):
                raise SdevError('Argument must be text', line)
            return args[0].strip()
        builtins['trim'] = trim
        
        def reverse(args, line):
            if len(args) != 1:
                raise SdevError('reverse() takes 1 argument', line)
            val = args[0]
            if isinstance(val, str):
                return val[::-1]
            if isinstance(val, list):
                return val[::-1]
            raise SdevError('Argument must be text or list', line)
        builtins['reverse'] = reverse
        
        def contains(args, line):
            if len(args) != 2:
                raise SdevError('contains() takes 2 arguments', line)
            haystack = args[0]
            needle = args[1]
            if isinstance(haystack, str) and isinstance(needle, str):
                return needle in haystack
            if isinstance(haystack, list):
                return needle in haystack
            raise SdevError('First argument must be text or list', line)
        builtins['contains'] = contains
        
        # Dict operations
        def inscriptions(args, line):
            if len(args) != 1:
                raise SdevError('inscriptions() takes 1 argument', line)
            obj = args[0]
            if not isinstance(obj, dict):
                raise SdevError('Argument must be a tome (dict)', line)
            return list(obj.keys())
        builtins['inscriptions'] = inscriptions
        
        def contents(args, line):
            if len(args) != 1:
                raise SdevError('contents() takes 1 argument', line)
            obj = args[0]
            if not isinstance(obj, dict):
                raise SdevError('Argument must be a tome (dict)', line)
            return list(obj.values())
        builtins['contents'] = contents
        
        # Matrix operations
        def matrix(args, line):
            if len(args) < 2:
                raise SdevError('matrix() takes at least 2 arguments (rows, cols, fill?)', line)
            rows = int(args[0])
            cols = int(args[1])
            fill = args[2] if len(args) > 2 else 0
            return [[fill for _ in range(cols)] for _ in range(rows)]
        builtins['matrix'] = matrix
        
        def transpose(args, line):
            if len(args) != 1:
                raise SdevError('transpose() takes 1 argument', line)
            m = args[0]
            if not isinstance(m, list) or not all(isinstance(row, list) for row in m):
                raise SdevError('Argument must be a 2D list', line)
            if len(m) == 0:
                return []
            return [[m[j][i] for j in range(len(m))] for i in range(len(m[0]))]
        builtins['transpose'] = transpose
        
        def dot(args, line):
            if len(args) != 2:
                raise SdevError('dot() takes 2 arguments', line)
            a, b = args[0], args[1]
            if isinstance(a, list) and isinstance(b, list):
                if all(isinstance(x, (int, float)) for x in a) and all(isinstance(x, (int, float)) for x in b):
                    if len(a) != len(b):
                        raise SdevError('Vectors must have same length', line)
                    return sum(x * y for x, y in zip(a, b))
            raise SdevError('Arguments must be numeric lists', line)
        builtins['dot'] = dot
        
        # File I/O (simulated for browser, real in CLI)
        def inscribe(args, line):
            if len(args) != 2:
                raise SdevError('inscribe() takes 2 arguments (path, content)', line)
            path = args[0]
            content = stringify(args[1])
            try:
                with open(path, 'w') as f:
                    f.write(content)
                return True
            except Exception as e:
                raise SdevError(f"Failed to write file: {e}", line)
        builtins['inscribe'] = inscribe
        
        def decipher(args, line):
            if len(args) != 1:
                raise SdevError('decipher() takes 1 argument (path)', line)
            path = args[0]
            try:
                with open(path, 'r') as f:
                    return f.read()
            except Exception as e:
                raise SdevError(f"Failed to read file: {e}", line)
        builtins['decipher'] = decipher
        
        # JSON
        def etch(args, line):
            if len(args) != 1:
                raise SdevError('etch() takes 1 argument', line)
            return json.dumps(args[0])
        builtins['etch'] = etch
        
        def unetch(args, line):
            if len(args) != 1:
                raise SdevError('unetch() takes 1 argument', line)
            try:
                return json.loads(args[0])
            except:
                raise SdevError('Invalid JSON', line)
        builtins['unetch'] = unetch
        
        # Higher-order functions
        def each(args, line):
            if len(args) != 2:
                raise SdevError('each() takes 2 arguments (list, transform)', line)
            arr = args[0]
            fn = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            return [self._call_function(fn, [item, i], line) for i, item in enumerate(arr)]
        builtins['each'] = each
        
        def sift(args, line):
            if len(args) != 2:
                raise SdevError('sift() takes 2 arguments (list, predicate)', line)
            arr = args[0]
            fn = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            return [item for item in arr if is_truthy(self._call_function(fn, [item], line))]
        builtins['sift'] = sift
        
        def fold(args, line):
            if len(args) != 3:
                raise SdevError('fold() takes 3 arguments (list, initial, reducer)', line)
            arr = args[0]
            acc = args[1]
            fn = args[2]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            for item in arr:
                acc = self._call_function(fn, [acc, item], line)
            return acc
        builtins['fold'] = fold
        
        return builtins
    
    def _call_function(self, func: Any, args: List[Any], line: int) -> Any:
        if isinstance(func, SdevBuiltin):
            return func.func(args, line)
        if isinstance(func, SdevUserFunc):
            return self._call_user_func(func, args, line)
        if isinstance(func, SdevLambda):
            return self._call_lambda(func, args, line)
        raise SdevError('Cannot call non-function', line)
    
    def _call_user_func(self, func: SdevUserFunc, args: List[Any], line: int) -> Any:
        if len(args) != len(func.params):
            raise SdevError(f"Function '{func.name}' expects {len(func.params)} arguments, got {len(args)}", line)
        func_env = Environment(func.closure)
        for i, param in enumerate(func.params):
            func_env.define(param, args[i])
        try:
            self._execute(func.body, func_env)
            return None
        except ReturnException as e:
            return e.value
    
    def _call_lambda(self, func: SdevLambda, args: List[Any], line: int) -> Any:
        if len(args) != len(func.params):
            raise SdevError(f"Lambda expects {len(func.params)} arguments, got {len(args)}", line)
        lambda_env = Environment(func.closure)
        for i, param in enumerate(func.params):
            lambda_env.define(param, args[i])
        return self._execute(func.body, lambda_env)
    
    def interpret(self, program: Program) -> Any:
        result = None
        for stmt in program.statements:
            result = self._execute(stmt, self.global_env)
        return result
    
    def _execute(self, node: ASTNode, env: Environment) -> Any:
        if isinstance(node, Program):
            result = None
            for stmt in node.statements:
                result = self._execute(stmt, env)
            return result
        
        if isinstance(node, NumberLiteral):
            return node.value
        if isinstance(node, StringLiteral):
            return node.value
        if isinstance(node, BooleanLiteral):
            return node.value
        if isinstance(node, NullLiteral):
            return None
        if isinstance(node, Identifier):
            return env.get(node.name, node.line)
        
        if isinstance(node, BinaryExpr):
            return self._execute_binary(node, env)
        if isinstance(node, UnaryExpr):
            return self._execute_unary(node, env)
        if isinstance(node, CallExpr):
            return self._execute_call(node, env)
        if isinstance(node, IndexExpr):
            return self._execute_index(node, env)
        if isinstance(node, MemberExpr):
            return self._execute_member(node, env)
        if isinstance(node, ArrayLiteral):
            return [self._execute(el, env) for el in node.elements]
        if isinstance(node, DictLiteral):
            return self._execute_dict(node, env)
        if isinstance(node, LambdaExpr):
            return SdevLambda(node.params, node.body, env)
        
        if isinstance(node, LetStatement):
            value = self._execute(node.value, env)
            env.define(node.name, value)
            return None
        if isinstance(node, AssignStatement):
            value = self._execute(node.value, env)
            env.set(node.name, value, node.line)
            return value
        if isinstance(node, IndexAssignStatement):
            return self._execute_index_assign(node, env)
        if isinstance(node, IfStatement):
            return self._execute_if(node, env)
        if isinstance(node, WhileStatement):
            return self._execute_while(node, env)
        if isinstance(node, ForInStatement):
            return self._execute_for_in(node, env)
        if isinstance(node, FuncDeclaration):
            return self._execute_func_decl(node, env)
        if isinstance(node, ReturnStatement):
            value = self._execute(node.value, env) if node.value else None
            raise ReturnException(value)
        if isinstance(node, BreakStatement):
            raise BreakException()
        if isinstance(node, ContinueStatement):
            raise ContinueException()
        if isinstance(node, BlockStatement):
            return self._execute_block(node, env)
        if isinstance(node, ExpressionStatement):
            return self._execute(node.expression, env)
        
        raise SdevError(f"Unknown node type: {type(node).__name__}", node.line)
    
    def _execute_binary(self, node: BinaryExpr, env: Environment) -> Any:
        # Short-circuit for also/either
        if node.operator == 'also':
            left = self._execute(node.left, env)
            if not self._is_truthy(left):
                return left
            return self._execute(node.right, env)
        if node.operator == 'either':
            left = self._execute(node.left, env)
            if self._is_truthy(left):
                return left
            return self._execute(node.right, env)
        
        left = self._execute(node.left, env)
        right = self._execute(node.right, env)
        
        op = node.operator
        if op == '+':
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                return left + right
            if isinstance(left, str) or isinstance(right, str):
                return self._stringify(left) + self._stringify(right)
            if isinstance(left, list) and isinstance(right, list):
                return left + right
            raise SdevError("Cannot use '+' with these types", node.line)
        if op == '-':
            return self._require_numbers(left, right, '-', node.line, lambda a, b: a - b)
        if op == '*':
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                return left * right
            if isinstance(left, str) and isinstance(right, (int, float)):
                return left * int(right)
            if isinstance(left, (int, float)) and isinstance(right, str):
                return right * int(left)
            raise SdevError("Cannot use '*' with these types", node.line)
        if op == '/':
            return self._require_numbers(left, right, '/', node.line, lambda a, b: a / b if b != 0 else (_ for _ in ()).throw(SdevError('Division by zero', node.line)))
        if op == '%':
            return self._require_numbers(left, right, '%', node.line, lambda a, b: a % b)
        if op == '^':
            return self._require_numbers(left, right, '^', node.line, lambda a, b: a ** b)
        if op == '<':
            return self._require_numbers(left, right, '<', node.line, lambda a, b: a < b)
        if op == '>':
            return self._require_numbers(left, right, '>', node.line, lambda a, b: a > b)
        if op == '<=':
            return self._require_numbers(left, right, '<=', node.line, lambda a, b: a <= b)
        if op == '>=':
            return self._require_numbers(left, right, '>=', node.line, lambda a, b: a >= b)
        if op == 'equals':
            return self._is_equal(left, right)
        if op == 'differs' or op == '<>':
            return not self._is_equal(left, right)
        
        raise SdevError(f"Unknown operator: {op}", node.line)
    
    def _execute_unary(self, node: UnaryExpr, env: Environment) -> Any:
        operand = self._execute(node.operand, env)
        if node.operator == '-':
            if not isinstance(operand, (int, float)):
                raise SdevError("Cannot use '-' with non-number", node.line)
            return -operand
        if node.operator == 'isnt':
            return not self._is_truthy(operand)
        raise SdevError(f"Unknown unary operator: {node.operator}", node.line)
    
    def _execute_call(self, node: CallExpr, env: Environment) -> Any:
        callee = self._execute(node.callee, env)
        args = [self._execute(arg, env) for arg in node.args]
        return self._call_function(callee, args, node.line)
    
    def _execute_index(self, node: IndexExpr, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        index = self._execute(node.index, env)
        
        if isinstance(obj, list):
            if not isinstance(index, (int, float)):
                raise SdevError('List index must be a number', node.line)
            idx = int(index)
            if idx < 0:
                idx = len(obj) + idx
            if idx < 0 or idx >= len(obj):
                raise SdevError('List index out of bounds', node.line)
            return obj[idx]
        
        if isinstance(obj, str):
            if not isinstance(index, (int, float)):
                raise SdevError('String index must be a number', node.line)
            idx = int(index)
            if idx < 0:
                idx = len(obj) + idx
            if idx < 0 or idx >= len(obj):
                raise SdevError('String index out of bounds', node.line)
            return obj[idx]
        
        if isinstance(obj, dict):
            key = self._stringify(index)
            return obj.get(key)
        
        raise SdevError('Cannot index this type', node.line)
    
    def _execute_member(self, node: MemberExpr, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        if isinstance(obj, dict):
            return obj.get(node.property)
        raise SdevError('Cannot access property on this type', node.line)
    
    def _execute_dict(self, node: DictLiteral, env: Environment) -> dict:
        result = {}
        for key, value in node.entries:
            k = self._stringify(self._execute(key, env))
            v = self._execute(value, env)
            result[k] = v
        return result
    
    def _execute_index_assign(self, node: IndexAssignStatement, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        index = self._execute(node.index, env)
        value = self._execute(node.value, env)
        
        if isinstance(obj, list):
            if not isinstance(index, (int, float)):
                raise SdevError('List index must be a number', node.line)
            idx = int(index)
            if idx < 0:
                idx = len(obj) + idx
            if idx < 0 or idx >= len(obj):
                raise SdevError('List index out of bounds', node.line)
            obj[idx] = value
            return value
        
        if isinstance(obj, dict):
            key = self._stringify(index)
            obj[key] = value
            return value
        
        raise SdevError('Cannot assign to index of this type', node.line)
    
    def _execute_if(self, node: IfStatement, env: Environment) -> Any:
        condition = self._execute(node.condition, env)
        if self._is_truthy(condition):
            return self._execute(node.then_branch, env)
        elif node.else_branch:
            return self._execute(node.else_branch, env)
        return None
    
    def _execute_while(self, node: WhileStatement, env: Environment) -> Any:
        result = None
        iterations = 0
        max_iterations = 100000
        
        while self._is_truthy(self._execute(node.condition, env)):
            try:
                result = self._execute(node.body, env)
            except BreakException:
                break
            except ContinueException:
                pass
            iterations += 1
            if iterations > max_iterations:
                raise SdevError('Maximum loop iterations exceeded', node.line)
        
        return result
    
    def _execute_for_in(self, node: ForInStatement, env: Environment) -> Any:
        iterable = self._execute(node.iterable, env)
        if not isinstance(iterable, (list, str)):
            raise SdevError('Can only iterate over lists or strings', node.line)
        
        result = None
        for_env = Environment(env)
        
        for item in iterable:
            try:
                for_env.define(node.var_name, item)
                result = self._execute(node.body, for_env)
            except BreakException:
                break
            except ContinueException:
                continue
        
        return result
    
    def _execute_func_decl(self, node: FuncDeclaration, env: Environment) -> None:
        func = SdevUserFunc(node.name, node.params, node.body, env)
        env.define(node.name, func)
    
    def _execute_block(self, node: BlockStatement, env: Environment) -> Any:
        block_env = Environment(env)
        result = None
        for stmt in node.statements:
            result = self._execute(stmt, block_env)
        return result
    
    def _require_numbers(self, left: Any, right: Any, op: str, line: int, fn: Callable) -> Any:
        if not isinstance(left, (int, float)) or not isinstance(right, (int, float)):
            raise SdevError(f"Cannot use '{op}' with non-numbers", line)
        return fn(left, right)
    
    def _is_equal(self, a: Any, b: Any) -> bool:
        if a is None and b is None:
            return True
        if a is None or b is None:
            return False
        if type(a) != type(b):
            return False
        if isinstance(a, list) and isinstance(b, list):
            if len(a) != len(b):
                return False
            return all(self._is_equal(x, y) for x, y in zip(a, b))
        return a == b
    
    def _is_truthy(self, value: Any) -> bool:
        if value is None:
            return False
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return value != 0
        if isinstance(value, str):
            return len(value) > 0
        if isinstance(value, list):
            return len(value) > 0
        return True
    
    def _stringify(self, value: Any) -> str:
        if value is None:
            return 'void'
        if isinstance(value, bool):
            return 'yep' if value else 'nope'
        if isinstance(value, (SdevBuiltin, SdevUserFunc, SdevLambda)):
            return '<conjuration>'
        if isinstance(value, list):
            return '[' + ', '.join(self._stringify(v) for v in value) + ']'
        if isinstance(value, dict):
            entries = ', '.join(f'{k}: {self._stringify(v)}' for k, v in value.items())
            return ':: ' + entries + ' ;;'
        return str(value)

# ============= Public API =============

def execute(source: str, output_callback: Callable[[str], None] = print) -> Dict[str, Any]:
    """Execute sdev code and return results."""
    output_lines = []
    
    def capture_output(msg: str):
        output_lines.append(msg)
        output_callback(msg)
    
    try:
        lexer = Lexer(source)
        tokens = lexer.tokenize()
        parser = Parser(tokens)
        ast = parser.parse()
        interpreter = Interpreter(capture_output)
        result = interpreter.interpret(ast)
        return {'success': True, 'output': output_lines, 'result': result}
    except SdevError as e:
        return {'success': False, 'output': output_lines, 'error': str(e)}
    except Exception as e:
        return {'success': False, 'output': output_lines, 'error': str(e)}

# ============= CLI =============

def repl():
    """Start interactive REPL."""
    print("sdev REPL v1.0.0")
    print("Type 'exit' to quit, 'help' for help")
    print()
    
    interpreter = Interpreter()
    
    while True:
        try:
            code = input("sdev> ")
            if code.strip() == 'exit':
                break
            if code.strip() == 'help':
                print("sdev - A unique programming language")
                print("Commands: exit, help")
                print("Example: speak('Hello!')")
                continue
            if not code.strip():
                continue
            
            result = execute(code, print)
            if not result['success']:
                print(f"❌ {result['error']}")
        except KeyboardInterrupt:
            print("\nUse 'exit' to quit")
        except EOFError:
            break
    
    print("Goodbye!")

def run_file(filepath: str):
    """Run a sdev file."""
    try:
        with open(filepath, 'r') as f:
            code = f.read()
        result = execute(code, print)
        if not result['success']:
            print(f"❌ {result['error']}")
            sys.exit(1)
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        run_file(sys.argv[1])
    else:
        repl()
