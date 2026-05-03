#!/usr/bin/env python3
"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                          SDEV PROGRAMMING LANGUAGE                             ║
║                        A Unique, Expressive Language                           ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Usage:                                                                        ║
║    python sdev-interpreter.py [file.sdev]  - Run a file                       ║
║    python sdev-interpreter.py              - Start interactive REPL           ║
║                                                                                ║
║  Library Usage:                                                                ║
║    from sdev_interpreter import execute, Interpreter                          ║
║    result = execute('speak("Hello, World!")')                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import sys
import os
import re
import math
import random
import json
import urllib.request
import urllib.error
from enum import Enum, auto
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Callable, Union, Tuple
from abc import ABC, abstractmethod

__version__ = "1.0.0"
__author__ = "sdev Team"

# ============= Token Types =============

class TokenType(Enum):
    NUMBER = auto()
    STRING = auto()
    IDENTIFIER = auto()
    
    # Keywords
    FORGE = auto()       # variable declaration
    CONJURE = auto()     # function declaration
    PONDER = auto()      # if statement
    OTHERWISE = auto()   # else
    CYCLE = auto()       # while loop
    WITHIN = auto()      # for-in loop
    YIELD = auto()       # return
    YEET = auto()        # break
    SKIP = auto()        # continue
    YEP = auto()         # true
    NOPE = auto()        # false
    VOID = auto()        # null
    BE = auto()          # assignment operator
    SUMMON = auto()      # import from gist
    ATTEMPT = auto()     # try
    RESCUE = auto()      # catch
    
    # OOP Keywords
    ESSENCE = auto()     # class declaration
    EXTEND = auto()      # inheritance
    SELF = auto()        # this reference
    SUPER = auto()       # parent reference
    NEW = auto()         # instantiation
    STATIC = auto()      # static method
    PRIVATE = auto()     # private member
    
    # Async Keywords
    AWAIT = auto()       # await
    ASYNC = auto()       # async function
    SPAWN = auto()       # spawn parallel task
    
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
    ALSO = auto()        # and
    EITHER = auto()      # or
    ISNT = auto()        # not
    
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
    AT = auto()
    
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
    'attempt': TokenType.ATTEMPT,
    'rescue': TokenType.RESCUE,
    # OOP
    'essence': TokenType.ESSENCE,
    'extend': TokenType.EXTEND,
    'self': TokenType.SELF,
    'super': TokenType.SUPER,
    'new': TokenType.NEW,
    'static': TokenType.STATIC,
    'private': TokenType.PRIVATE,
    # Async
    'await': TokenType.AWAIT,
    'async': TokenType.ASYNC,
    'spawn': TokenType.SPAWN,
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
    """Base error for sdev interpreter"""
    def __init__(self, message: str, line: int = 0, column: int = 0):
        self.line = line
        self.column = column
        loc = f"[line {line}]" if column == 0 else f"[line {line}, col {column}]"
        super().__init__(f"{loc} {message}")

class ReturnException(Exception):
    """Used to implement return statements"""
    def __init__(self, value: Any):
        self.value = value

class BreakException(Exception):
    """Used to implement break statements"""
    pass

class ContinueException(Exception):
    """Used to implement continue statements"""
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
            '@': TokenType.AT,
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
                # Comment - skip to end of line
                while not self.is_at_end() and self.peek() != '\n':
                    self.advance()
                return
            self.add_token(TokenType.SLASH, char, start_column)
            return
        
        if char == '#':
            # Also a comment
            while not self.is_at_end() and self.peek() != '\n':
                self.advance()
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
        start_line = self.line
        while not self.is_at_end() and self.peek() != quote:
            if self.peek() == '\n':
                if quote == '`':
                    value += self.advance()
                    self.line += 1
                    self.column = 1
                    continue
                raise SdevError('Unterminated string', start_line, start_column)
            if self.peek() == '\\':
                self.advance()
                if self.is_at_end():
                    raise SdevError('Unterminated string', start_line, start_column)
                escaped = self.advance()
                escapes = {'n': '\n', 't': '\t', 'r': '\r', '\\': '\\', '"': '"', "'": "'", '`': '`', '0': '\0'}
                value += escapes.get(escaped, escaped)
            else:
                value += self.advance()
        if self.is_at_end():
            raise SdevError('Unterminated string', start_line, start_column)
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
        # Scientific notation
        if self.peek().lower() == 'e':
            value += self.advance()
            if self.peek() in '+-':
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
class SliceExpr(ASTNode):
    obj: ASTNode
    start: Optional[ASTNode]
    end: Optional[ASTNode]
    step: Optional[ASTNode]

@dataclass
class MemberExpr(ASTNode):
    obj: ASTNode
    property: str

@dataclass
class ArrayLiteral(ASTNode):
    elements: List[ASTNode]

@dataclass
class DictLiteral(ASTNode):
    entries: List[Tuple[ASTNode, ASTNode]]

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
class MemberAssignStatement(ASTNode):
    obj: ASTNode
    property: str
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
class TryStatement(ASTNode):
    try_block: 'BlockStatement'
    error_var: Optional[str]
    catch_block: Optional['BlockStatement']

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

# ============= OOP AST Nodes =============

@dataclass
class ClassDeclaration(ASTNode):
    name: str
    parent: Optional[str]
    methods: List['MethodDeclaration']
    static_methods: List['MethodDeclaration']
    constructor: Optional['MethodDeclaration']

@dataclass
class MethodDeclaration(ASTNode):
    name: str
    params: List[str]
    body: 'BlockStatement'
    is_private: bool = False

@dataclass
class NewExpr(ASTNode):
    class_name: str
    args: List[ASTNode]

@dataclass
class SelfExpr(ASTNode):
    pass

@dataclass
class SuperExpr(ASTNode):
    method: Optional[str] = None
    args: Optional[List[ASTNode]] = None

@dataclass
class PropertyAccessExpr(ASTNode):
    obj: ASTNode
    property: str

# ============= Async AST Nodes =============

@dataclass
class AsyncFuncDeclaration(ASTNode):
    name: str
    params: List[str]
    body: 'BlockStatement'

@dataclass
class AwaitExpr(ASTNode):
    expression: ASTNode

@dataclass
class SpawnExpr(ASTNode):
    expressions: List[ASTNode]

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
            stmt = self.parse_statement()
            if stmt:
                statements.append(stmt)
        return Program(1, statements)
    
    def parse_statement(self) -> Optional[ASTNode]:
        if self.check(TokenType.FORGE):
            return self.parse_forge_statement()
        if self.check(TokenType.CONJURE):
            return self.parse_conjure_declaration()
        if self.check(TokenType.ASYNC):
            return self.parse_async_declaration()
        if self.check(TokenType.ESSENCE):
            return self.parse_class_declaration()
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
        if self.check(TokenType.ATTEMPT):
            return self.parse_attempt_statement()
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
    
    def parse_attempt_statement(self) -> TryStatement:
        attempt_token = self.consume(TokenType.ATTEMPT, "Expected 'attempt'")
        try_block = self.parse_block_statement()
        
        error_var = None
        catch_block = None
        if self.match(TokenType.RESCUE):
            if self.check(TokenType.IDENTIFIER):
                error_var = self.consume(TokenType.IDENTIFIER, "Expected error variable").value
            catch_block = self.parse_block_statement()
        
        return TryStatement(attempt_token.line, try_block, error_var, catch_block)
    
    def parse_block_statement(self) -> BlockStatement:
        colon_token = self.consume(TokenType.DOUBLE_COLON, "Expected '::'")
        statements = []
        while not self.check(TokenType.DOUBLE_SEMI) and not self.is_at_end():
            stmt = self.parse_statement()
            if stmt:
                statements.append(stmt)
        self.consume(TokenType.DOUBLE_SEMI, "Expected ';;'")
        return BlockStatement(colon_token.line, statements)
    
    def parse_expression_statement(self) -> Optional[ASTNode]:
        expr = self.parse_expression()
        
        if self.match(TokenType.BE):
            value = self.parse_expression()
            
            if isinstance(expr, Identifier):
                return AssignStatement(expr.line, expr.name, value)
            if isinstance(expr, IndexExpr):
                return IndexAssignStatement(expr.line, expr.obj, expr.index, value)
            if isinstance(expr, MemberExpr):
                return MemberAssignStatement(expr.line, expr.obj, expr.property, value)
            raise SdevError('Invalid assignment target', expr.line)
        
        return ExpressionStatement(expr.line, expr)
    
    def parse_expression(self) -> ASTNode:
        return self.parse_ternary()
    
    def parse_ternary(self) -> ASTNode:
        expr = self.parse_pipe()
        
        if self.match(TokenType.TILDE):
            then_val = self.parse_expression()
            self.consume(TokenType.COLON, "Expected ':' in ternary")
            else_val = self.parse_expression()
            # Create inline if expression
            return CallExpr(expr.line, Identifier(expr.line, '__ternary__'), [expr, then_val, else_val])
        
        return expr
    
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
                expr = self.parse_index_or_slice(expr)
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
    
    def parse_index_or_slice(self, obj: ASTNode) -> ASTNode:
        # Check for slice syntax: [start:end:step] or simple index [idx]
        start = None
        end = None
        step = None
        
        if self.check(TokenType.COLON):
            # [:...] - no start
            pass
        elif not self.check(TokenType.RBRACKET):
            start = self.parse_expression()
        
        if self.match(TokenType.COLON):
            # This is a slice
            if not self.check(TokenType.COLON) and not self.check(TokenType.RBRACKET):
                end = self.parse_expression()
            if self.match(TokenType.COLON):
                if not self.check(TokenType.RBRACKET):
                    step = self.parse_expression()
            self.consume(TokenType.RBRACKET, "Expected ']'")
            return SliceExpr(obj.line, obj, start, end, step)
        else:
            self.consume(TokenType.RBRACKET, "Expected ']'")
            return IndexExpr(obj.line, obj, start)
    
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
        
        if self.match(TokenType.SELF):
            return SelfExpr(token.line)
        
        if self.match(TokenType.SUPER):
            # super.method() or super()
            if self.match(TokenType.DOT):
                method = self.consume(TokenType.IDENTIFIER, "Expected method name after 'super.'").value
                if self.match(TokenType.LPAREN):
                    args = []
                    if not self.check(TokenType.RPAREN):
                        args.append(self.parse_expression())
                        while self.match(TokenType.COMMA):
                            args.append(self.parse_expression())
                    self.consume(TokenType.RPAREN, "Expected ')'")
                    return SuperExpr(token.line, method, args)
                return SuperExpr(token.line, method, None)
            return SuperExpr(token.line, None, None)
        
        if self.match(TokenType.NEW):
            class_name = self.consume(TokenType.IDENTIFIER, "Expected class name").value
            self.consume(TokenType.LPAREN, "Expected '('")
            args = []
            if not self.check(TokenType.RPAREN):
                args.append(self.parse_expression())
                while self.match(TokenType.COMMA):
                    args.append(self.parse_expression())
            self.consume(TokenType.RPAREN, "Expected ')'")
            return NewExpr(token.line, class_name, args)
        
        if self.match(TokenType.AWAIT):
            expr = self.parse_unary()
            return AwaitExpr(token.line, expr)
        
        if self.match(TokenType.SPAWN):
            self.consume(TokenType.LPAREN, "Expected '('")
            exprs = []
            if not self.check(TokenType.RPAREN):
                exprs.append(self.parse_expression())
                while self.match(TokenType.COMMA):
                    exprs.append(self.parse_expression())
            self.consume(TokenType.RPAREN, "Expected ')'")
            return SpawnExpr(token.line, exprs)
        
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
            if len(exprs) == 0:
                # Empty parens for unit/void
                return NullLiteral(token.line)
            raise SdevError('Unexpected multiple expressions', token.line)
        
        if self.match(TokenType.LBRACKET):
            return self.parse_array_literal(token.line)
        
        if self.match(TokenType.DOUBLE_COLON):
            return self.parse_dict_literal(token.line)
        
        raise SdevError(f"Unexpected token: '{token.value}'", token.line, token.column)
    
    def parse_class_declaration(self) -> ClassDeclaration:
        """Parse: essence ClassName extend Parent :: methods ;; """
        essence_token = self.consume(TokenType.ESSENCE, "Expected 'essence'")
        name = self.consume(TokenType.IDENTIFIER, "Expected class name").value
        
        parent = None
        if self.match(TokenType.EXTEND):
            parent = self.consume(TokenType.IDENTIFIER, "Expected parent class name").value
        
        self.consume(TokenType.DOUBLE_COLON, "Expected '::'")
        
        methods = []
        static_methods = []
        constructor = None
        
        while not self.check(TokenType.DOUBLE_SEMI) and not self.is_at_end():
            is_static = self.match(TokenType.STATIC)
            is_private = self.match(TokenType.PRIVATE)
            
            if self.check(TokenType.CONJURE):
                self.advance()
                method_name = self.consume(TokenType.IDENTIFIER, "Expected method name").value
                self.consume(TokenType.LPAREN, "Expected '('")
                
                params = []
                if not self.check(TokenType.RPAREN):
                    params.append(self.consume(TokenType.IDENTIFIER, "Expected parameter").value)
                    while self.match(TokenType.COMMA):
                        params.append(self.consume(TokenType.IDENTIFIER, "Expected parameter").value)
                self.consume(TokenType.RPAREN, "Expected ')'")
                
                body = self.parse_block_statement()
                method = MethodDeclaration(essence_token.line, method_name, params, body, is_private)
                
                if method_name == "init" and not is_static:
                    constructor = method
                elif is_static:
                    static_methods.append(method)
                else:
                    methods.append(method)
        
        self.consume(TokenType.DOUBLE_SEMI, "Expected ';;'")
        return ClassDeclaration(essence_token.line, name, parent, methods, static_methods, constructor)
    
    def parse_async_declaration(self) -> AsyncFuncDeclaration:
        """Parse: async conjure name(params) :: body ;;"""
        async_token = self.consume(TokenType.ASYNC, "Expected 'async'")
        self.consume(TokenType.CONJURE, "Expected 'conjure' after 'async'")
        name = self.consume(TokenType.IDENTIFIER, "Expected function name").value
        self.consume(TokenType.LPAREN, "Expected '('")
        
        params = []
        if not self.check(TokenType.RPAREN):
            params.append(self.consume(TokenType.IDENTIFIER, "Expected parameter").value)
            while self.match(TokenType.COMMA):
                params.append(self.consume(TokenType.IDENTIFIER, "Expected parameter").value)
        self.consume(TokenType.RPAREN, "Expected ')'")
        
        body = self.parse_block_statement()
        return AsyncFuncDeclaration(async_token.line, name, params, body)
    
    def parse_array_literal(self, line: int) -> ArrayLiteral:
        elements = []
        if not self.check(TokenType.RBRACKET):
            elements.append(self.parse_expression())
            while self.match(TokenType.COMMA):
                if self.check(TokenType.RBRACKET):
                    break  # Allow trailing comma
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
                if self.check(TokenType.DOUBLE_SEMI):
                    break  # Allow trailing comma
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
    
    def has(self, name: str) -> bool:
        if name in self.values:
            return True
        if self.parent:
            return self.parent.has(name)
        return False

# ============= Function Types =============

@dataclass
class SdevBuiltin:
    name: str
    func: Callable
    min_args: int = 0
    max_args: int = -1  # -1 means unlimited

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

# ============= OOP Runtime Types =============

@dataclass
class SdevClass:
    """Runtime representation of a class"""
    name: str
    parent: Optional['SdevClass']
    methods: Dict[str, 'SdevMethod']
    static_methods: Dict[str, 'SdevMethod']
    constructor: Optional['SdevMethod']

@dataclass
class SdevMethod:
    """Runtime representation of a method"""
    name: str
    params: List[str]
    body: BlockStatement
    is_private: bool
    closure: Environment

@dataclass
class SdevInstance:
    """Runtime instance of a class"""
    sdev_class: SdevClass
    fields: Dict[str, Any]

@dataclass
class SdevBoundMethod:
    """A method bound to an instance"""
    instance: SdevInstance
    method: 'SdevMethod'

# ============= Async Runtime Types =============

@dataclass
class SdevAsyncFunc:
    """Async function"""
    name: str
    params: List[str]
    body: BlockStatement
    closure: Environment

@dataclass
class SdevPromise:
    """Promise-like wrapper for async results"""
    value: Any = None
    resolved: bool = False
    error: Optional[str] = None

# ============= Data Structure Types =============

class SdevSet:
    """Set data structure"""
    def __init__(self, items=None):
        self._items = list(items) if items else []
    
    def add(self, item):
        if item not in self._items:
            self._items.append(item)
    
    def remove(self, item):
        if item in self._items:
            self._items.remove(item)
    
    def has(self, item):
        return item in self._items
    
    def size(self):
        return len(self._items)
    
    def values(self):
        return self._items.copy()
    
    def union(self, other):
        result = SdevSet(self._items)
        for item in other._items:
            result.add(item)
        return result
    
    def intersect(self, other):
        return SdevSet([x for x in self._items if x in other._items])
    
    def difference(self, other):
        return SdevSet([x for x in self._items if x not in other._items])
    
    def __repr__(self):
        return f"Set({self._items})"

class SdevMap:
    """Map/HashMap data structure"""
    def __init__(self):
        self._data = {}
    
    def set(self, key, value):
        self._data[str(key)] = value
    
    def get(self, key, default=None):
        return self._data.get(str(key), default)
    
    def has(self, key):
        return str(key) in self._data
    
    def remove(self, key):
        if str(key) in self._data:
            del self._data[str(key)]
    
    def size(self):
        return len(self._data)
    
    def keys(self):
        return list(self._data.keys())
    
    def values(self):
        return list(self._data.values())
    
    def entries(self):
        return [[k, v] for k, v in self._data.items()]
    
    def __repr__(self):
        return f"Map({self._data})"

class SdevQueue:
    """Queue (FIFO) data structure"""
    def __init__(self):
        self._items = []
    
    def enqueue(self, item):
        self._items.append(item)
    
    def dequeue(self):
        if not self._items:
            return None
        return self._items.pop(0)
    
    def peek(self):
        if not self._items:
            return None
        return self._items[0]
    
    def isEmpty(self):
        return len(self._items) == 0
    
    def size(self):
        return len(self._items)
    
    def __repr__(self):
        return f"Queue({self._items})"

class SdevStack:
    """Stack (LIFO) data structure"""
    def __init__(self):
        self._items = []
    
    def push(self, item):
        self._items.append(item)
    
    def pop(self):
        if not self._items:
            return None
        return self._items.pop()
    
    def peek(self):
        if not self._items:
            return None
        return self._items[-1]
    
    def isEmpty(self):
        return len(self._items) == 0
    
    def size(self):
        return len(self._items)
    
    def __repr__(self):
        return f"Stack({self._items})"

class SdevLinkedListNode:
    """Node for linked list"""
    def __init__(self, value):
        self.value = value
        self.next = None
        self.prev = None

class SdevLinkedList:
    """Doubly linked list data structure"""
    def __init__(self):
        self.head = None
        self.tail = None
        self._size = 0
    
    def append(self, value):
        node = SdevLinkedListNode(value)
        if not self.head:
            self.head = self.tail = node
        else:
            node.prev = self.tail
            self.tail.next = node
            self.tail = node
        self._size += 1
    
    def prepend(self, value):
        node = SdevLinkedListNode(value)
        if not self.head:
            self.head = self.tail = node
        else:
            node.next = self.head
            self.head.prev = node
            self.head = node
        self._size += 1
    
    def remove(self, value):
        current = self.head
        while current:
            if current.value == value:
                if current.prev:
                    current.prev.next = current.next
                else:
                    self.head = current.next
                if current.next:
                    current.next.prev = current.prev
                else:
                    self.tail = current.prev
                self._size -= 1
                return True
            current = current.next
        return False
    
    def toList(self):
        result = []
        current = self.head
        while current:
            result.append(current.value)
            current = current.next
        return result
    
    def size(self):
        return self._size
    
    def __repr__(self):
        return f"LinkedList({self.toList()})"

# ============= Graphics Types =============

class SdevSprite:
    """Sprite for game development"""
    def __init__(self, x=0, y=0, width=32, height=32, color="white"):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.color = color
        self.velocity_x = 0
        self.velocity_y = 0
        self.visible = True
        self.rotation = 0
        self.scale = 1.0
        self.tag = ""
    
    def move(self, dx, dy):
        self.x += dx
        self.y += dy
    
    def moveTo(self, x, y):
        self.x = x
        self.y = y
    
    def update(self):
        self.x += self.velocity_x
        self.y += self.velocity_y
    
    def collidesWith(self, other):
        return (self.x < other.x + other.width and
                self.x + self.width > other.x and
                self.y < other.y + other.height and
                self.y + self.height > other.y)
    
    def __repr__(self):
        return f"Sprite(x={self.x}, y={self.y}, w={self.width}, h={self.height})"

class SdevVector2:
    """2D Vector for physics and math"""
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y
    
    def add(self, other):
        return SdevVector2(self.x + other.x, self.y + other.y)
    
    def sub(self, other):
        return SdevVector2(self.x - other.x, self.y - other.y)
    
    def scale(self, scalar):
        return SdevVector2(self.x * scalar, self.y * scalar)
    
    def magnitude(self):
        return math.sqrt(self.x**2 + self.y**2)
    
    def normalize(self):
        mag = self.magnitude()
        if mag == 0:
            return SdevVector2(0, 0)
        return SdevVector2(self.x / mag, self.y / mag)
    
    def dot(self, other):
        return self.x * other.x + self.y * other.y
    
    def distance(self, other):
        return math.sqrt((self.x - other.x)**2 + (self.y - other.y)**2)
    
    def angle(self):
        return math.atan2(self.y, self.x)
    
    def rotate(self, angle):
        cos_a = math.cos(angle)
        sin_a = math.sin(angle)
        return SdevVector2(
            self.x * cos_a - self.y * sin_a,
            self.x * sin_a + self.y * cos_a
        )
    
    def __repr__(self):
        return f"Vec2({self.x}, {self.y})"

class SdevColor:
    """Color utilities"""
    @staticmethod
    def rgb(r, g, b):
        return f"rgb({int(r)},{int(g)},{int(b)})"
    
    @staticmethod
    def rgba(r, g, b, a):
        return f"rgba({int(r)},{int(g)},{int(b)},{a})"
    
    @staticmethod
    def hsl(h, s, l):
        return f"hsl({h},{s}%,{l}%)"
    
    @staticmethod
    def hex(value):
        if isinstance(value, str):
            return value if value.startswith('#') else f"#{value}"
        return f"#{value:06x}"

# ============= Interpreter =============

class Interpreter:
    def __init__(self, output_callback: Callable[[str], None] = print):
        self.output = output_callback
        self.global_env = Environment()
        self.max_iterations = 1_000_000
        self._register_builtins()
    
    def _register_builtins(self):
        """Register all built-in functions and constants"""
        builtins = self._create_builtins()
        for name, func in builtins.items():
            self.global_env.define(name, func)
        
        # Register constants
        self.global_env.define('PI', math.pi)
        self.global_env.define('TAU', math.tau)
        self.global_env.define('E', math.e)
        self.global_env.define('INFINITY', float('inf'))
    
    def _create_builtins(self) -> Dict[str, SdevBuiltin]:
        """Create all built-in functions"""
        builtins = {}
        
        # ========== Ternary Helper ==========
        def ternary(args, line):
            if len(args) != 3:
                raise SdevError('__ternary__ takes 3 arguments', line)
            condition, then_val, else_val = args
            return then_val if self._is_truthy(condition) else else_val
        builtins['__ternary__'] = SdevBuiltin('__ternary__', ternary, 3, 3)
        
        # ========== Output Functions ==========
        def speak(args, line):
            msg = ' '.join(self._stringify(a) for a in args)
            self.output(msg)
            return None
        builtins['speak'] = SdevBuiltin('speak', speak)
        
        def whisper(args, line):
            msg = ''.join(self._stringify(a) for a in args)
            self.output(msg)
            return None
        builtins['whisper'] = SdevBuiltin('whisper', whisper)
        
        def shout(args, line):
            msg = ' '.join(self._stringify(a) for a in args).upper()
            self.output(msg)
            return None
        builtins['shout'] = SdevBuiltin('shout', shout)
        
        # ========== Collection Functions ==========
        def measure(args, line):
            if len(args) != 1:
                raise SdevError('measure() takes exactly 1 argument', line)
            arg = args[0]
            if isinstance(arg, (str, list)):
                return len(arg)
            if isinstance(arg, dict):
                return len(arg)
            raise SdevError('measure() argument must be text, list, or tome', line)
        builtins['measure'] = SdevBuiltin('measure', measure, 1, 1)
        
        def sequence(args, line):
            if len(args) < 1 or len(args) > 3:
                raise SdevError('sequence() takes 1 to 3 arguments', line)
            if len(args) == 1:
                return list(range(int(args[0])))
            elif len(args) == 2:
                return list(range(int(args[0]), int(args[1])))
            else:
                return list(range(int(args[0]), int(args[1]), int(args[2])))
        builtins['sequence'] = SdevBuiltin('sequence', sequence, 1, 3)
        
        def gather(args, line):
            if len(args) != 2:
                raise SdevError('gather() takes 2 arguments', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            arr.append(args[1])
            return arr
        builtins['gather'] = SdevBuiltin('gather', gather, 2, 2)
        
        def pluck(args, line):
            if len(args) != 1:
                raise SdevError('pluck() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            if len(arr) == 0:
                raise SdevError('Cannot pluck from empty list', line)
            return arr.pop()
        builtins['pluck'] = SdevBuiltin('pluck', pluck, 1, 1)
        
        def snatch(args, line):
            """Remove and return item at index"""
            if len(args) != 2:
                raise SdevError('snatch() takes 2 arguments (list, index)', line)
            arr = args[0]
            idx = int(args[1])
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            if idx < -len(arr) or idx >= len(arr):
                raise SdevError('Index out of bounds', line)
            return arr.pop(idx)
        builtins['snatch'] = SdevBuiltin('snatch', snatch, 2, 2)
        
        def insert(args, line):
            """Insert item at index"""
            if len(args) != 3:
                raise SdevError('insert() takes 3 arguments (list, index, item)', line)
            arr = args[0]
            idx = int(args[1])
            item = args[2]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            arr.insert(idx, item)
            return arr
        builtins['insert'] = SdevBuiltin('insert', insert, 3, 3)
        
        def portion(args, line):
            if len(args) < 2 or len(args) > 3:
                raise SdevError('portion() takes 2 or 3 arguments', line)
            arr = args[0]
            if not isinstance(arr, (list, str)):
                raise SdevError('First argument must be a list or text', line)
            start = int(args[1])
            end = int(args[2]) if len(args) == 3 else None
            return arr[start:end]
        builtins['portion'] = SdevBuiltin('portion', portion, 2, 3)
        
        def weave(args, line):
            if len(args) != 2:
                raise SdevError('weave() takes 2 arguments', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            sep = args[1]
            if not isinstance(sep, str):
                raise SdevError('Second argument must be text', line)
            return sep.join(self._stringify(item) for item in arr)
        builtins['weave'] = SdevBuiltin('weave', weave, 2, 2)
        
        def shatter(args, line):
            if len(args) < 1 or len(args) > 2:
                raise SdevError('shatter() takes 1 or 2 arguments', line)
            text = args[0]
            if not isinstance(text, str):
                raise SdevError('First argument must be text', line)
            sep = args[1] if len(args) > 1 else None
            if sep is not None and not isinstance(sep, str):
                raise SdevError('Second argument must be text', line)
            return text.split(sep)
        builtins['shatter'] = SdevBuiltin('shatter', shatter, 1, 2)
        
        def clone(args, line):
            """Deep copy a value"""
            if len(args) != 1:
                raise SdevError('clone() takes 1 argument', line)
            import copy
            return copy.deepcopy(args[0])
        builtins['clone'] = SdevBuiltin('clone', clone, 1, 1)
        
        # ========== Higher-Order Functions ==========
        def each(args, line):
            if len(args) != 2:
                raise SdevError('each() takes 2 arguments (list, transform)', line)
            arr = args[0]
            fn = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            return [self._call_function(fn, [item, i], line) for i, item in enumerate(arr)]
        builtins['each'] = SdevBuiltin('each', each, 2, 2)
        
        def sift(args, line):
            if len(args) != 2:
                raise SdevError('sift() takes 2 arguments (list, predicate)', line)
            arr = args[0]
            fn = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            return [item for item in arr if self._is_truthy(self._call_function(fn, [item], line))]
        builtins['sift'] = SdevBuiltin('sift', sift, 2, 2)
        
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
        builtins['fold'] = SdevBuiltin('fold', fold, 3, 3)
        
        def seek(args, line):
            """Find first element matching predicate"""
            if len(args) != 2:
                raise SdevError('seek() takes 2 arguments (list, predicate)', line)
            arr = args[0]
            fn = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            for item in arr:
                if self._is_truthy(self._call_function(fn, [item], line)):
                    return item
            return None
        builtins['seek'] = SdevBuiltin('seek', seek, 2, 2)
        
        def every(args, line):
            """Check if all elements match predicate"""
            if len(args) != 2:
                raise SdevError('every() takes 2 arguments (list, predicate)', line)
            arr = args[0]
            fn = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            return all(self._is_truthy(self._call_function(fn, [item], line)) for item in arr)
        builtins['every'] = SdevBuiltin('every', every, 2, 2)
        
        def some(args, line):
            """Check if any element matches predicate"""
            if len(args) != 2:
                raise SdevError('some() takes 2 arguments (list, predicate)', line)
            arr = args[0]
            fn = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            return any(self._is_truthy(self._call_function(fn, [item], line)) for item in arr)
        builtins['some'] = SdevBuiltin('some', some, 2, 2)
        
        def zip_lists(args, line):
            """Zip multiple lists together"""
            if len(args) < 2:
                raise SdevError('zip() takes at least 2 arguments', line)
            for arg in args:
                if not isinstance(arg, list):
                    raise SdevError('All arguments must be lists', line)
            return [list(t) for t in zip(*args)]
        builtins['zip'] = SdevBuiltin('zip', zip_lists, 2)
        
        def enumerate_list(args, line):
            """Return list of [index, item] pairs"""
            if len(args) != 1:
                raise SdevError('enumerate() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            return [[i, item] for i, item in enumerate(arr)]
        builtins['enumerate'] = SdevBuiltin('enumerate', enumerate_list, 1, 1)
        
        # ========== Type Conversion ==========
        def morph(args, line):
            if len(args) != 2:
                raise SdevError('morph() takes 2 arguments (value, type)', line)
            val = args[0]
            target = args[1]
            if not isinstance(target, str):
                raise SdevError('Second argument must be type name', line)
            
            if target == 'number':
                if isinstance(val, (int, float)):
                    return val
                if isinstance(val, str):
                    try:
                        return float(val) if '.' in val else int(val)
                    except ValueError:
                        raise SdevError(f"Cannot morph '{val}' to number", line)
                if isinstance(val, bool):
                    return 1 if val else 0
                raise SdevError('Cannot morph to number', line)
            elif target == 'text':
                return self._stringify(val)
            elif target == 'truth':
                return self._is_truthy(val)
            elif target == 'list':
                if isinstance(val, list):
                    return val
                if isinstance(val, str):
                    return list(val)
                if isinstance(val, dict):
                    return list(val.items())
                raise SdevError('Cannot morph to list', line)
            else:
                raise SdevError(f"Unknown type: {target}", line)
        builtins['morph'] = SdevBuiltin('morph', morph, 2, 2)
        
        def essence(args, line):
            if len(args) != 1:
                raise SdevError('essence() takes 1 argument', line)
            val = args[0]
            if val is None:
                return 'void'
            if isinstance(val, bool):
                return 'truth'
            if isinstance(val, (int, float)):
                return 'number'
            if isinstance(val, str):
                return 'text'
            if isinstance(val, list):
                return 'list'
            if isinstance(val, dict):
                return 'tome'
            if isinstance(val, (SdevBuiltin, SdevUserFunc, SdevLambda)):
                return 'conjuration'
            return 'mystery'
        builtins['essence'] = SdevBuiltin('essence', essence, 1, 1)
        
        # ========== Math Functions ==========
        def magnitude(args, line):
            if len(args) != 1:
                raise SdevError('magnitude() takes 1 argument', line)
            return abs(args[0])
        builtins['magnitude'] = SdevBuiltin('magnitude', magnitude, 1, 1)
        
        def least(args, line):
            if len(args) == 0:
                raise SdevError('least() takes at least 1 argument', line)
            if len(args) == 1 and isinstance(args[0], list):
                if len(args[0]) == 0:
                    raise SdevError('Cannot find least of empty list', line)
                return min(args[0])
            return min(args)
        builtins['least'] = SdevBuiltin('least', least, 1)
        
        def greatest(args, line):
            if len(args) == 0:
                raise SdevError('greatest() takes at least 1 argument', line)
            if len(args) == 1 and isinstance(args[0], list):
                if len(args[0]) == 0:
                    raise SdevError('Cannot find greatest of empty list', line)
                return max(args[0])
            return max(args)
        builtins['greatest'] = SdevBuiltin('greatest', greatest, 1)
        
        def root(args, line):
            if len(args) != 1:
                raise SdevError('root() takes 1 argument', line)
            return math.sqrt(args[0])
        builtins['root'] = SdevBuiltin('root', root, 1, 1)
        
        def ground(args, line):
            if len(args) != 1:
                raise SdevError('ground() takes 1 argument', line)
            return math.floor(args[0])
        builtins['ground'] = SdevBuiltin('ground', ground, 1, 1)
        
        def elevate(args, line):
            if len(args) != 1:
                raise SdevError('elevate() takes 1 argument', line)
            return math.ceil(args[0])
        builtins['elevate'] = SdevBuiltin('elevate', elevate, 1, 1)
        
        def nearby(args, line):
            if len(args) < 1 or len(args) > 2:
                raise SdevError('nearby() takes 1 or 2 arguments', line)
            if len(args) == 2:
                return round(args[0], int(args[1]))
            return round(args[0])
        builtins['nearby'] = SdevBuiltin('nearby', nearby, 1, 2)
        
        def chaos(args, line):
            return random.random()
        builtins['chaos'] = SdevBuiltin('chaos', chaos, 0, 0)
        
        def randint(args, line):
            if len(args) != 2:
                raise SdevError('randint() takes 2 arguments', line)
            return random.randint(int(args[0]), int(args[1]))
        builtins['randint'] = SdevBuiltin('randint', randint, 2, 2)
        
        def pick(args, line):
            if len(args) != 1:
                raise SdevError('pick() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            if len(arr) == 0:
                return None
            return random.choice(arr)
        builtins['pick'] = SdevBuiltin('pick', pick, 1, 1)
        
        def shuffle(args, line):
            if len(args) != 1:
                raise SdevError('shuffle() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            shuffled = arr.copy()
            random.shuffle(shuffled)
            return shuffled
        builtins['shuffle'] = SdevBuiltin('shuffle', shuffle, 1, 1)
        
        # Trigonometric functions
        builtins['sin'] = SdevBuiltin('sin', lambda a, l: math.sin(a[0]), 1, 1)
        builtins['cos'] = SdevBuiltin('cos', lambda a, l: math.cos(a[0]), 1, 1)
        builtins['tan'] = SdevBuiltin('tan', lambda a, l: math.tan(a[0]), 1, 1)
        builtins['asin'] = SdevBuiltin('asin', lambda a, l: math.asin(a[0]), 1, 1)
        builtins['acos'] = SdevBuiltin('acos', lambda a, l: math.acos(a[0]), 1, 1)
        builtins['atan'] = SdevBuiltin('atan', lambda a, l: math.atan(a[0]), 1, 1)
        builtins['atan2'] = SdevBuiltin('atan2', lambda a, l: math.atan2(a[0], a[1]), 2, 2)
        builtins['sinh'] = SdevBuiltin('sinh', lambda a, l: math.sinh(a[0]), 1, 1)
        builtins['cosh'] = SdevBuiltin('cosh', lambda a, l: math.cosh(a[0]), 1, 1)
        builtins['tanh'] = SdevBuiltin('tanh', lambda a, l: math.tanh(a[0]), 1, 1)
        
        # Logarithmic functions
        builtins['log'] = SdevBuiltin('log', lambda a, l: math.log(a[0]) if len(a) == 1 else math.log(a[0], a[1]), 1, 2)
        builtins['log10'] = SdevBuiltin('log10', lambda a, l: math.log10(a[0]), 1, 1)
        builtins['log2'] = SdevBuiltin('log2', lambda a, l: math.log2(a[0]), 1, 1)
        builtins['exp'] = SdevBuiltin('exp', lambda a, l: math.exp(a[0]), 1, 1)
        
        # ========== String Functions ==========
        def upper(args, line):
            if len(args) != 1:
                raise SdevError('upper() takes 1 argument', line)
            if not isinstance(args[0], str):
                raise SdevError('Argument must be text', line)
            return args[0].upper()
        builtins['upper'] = SdevBuiltin('upper', upper, 1, 1)
        
        def lower(args, line):
            if len(args) != 1:
                raise SdevError('lower() takes 1 argument', line)
            if not isinstance(args[0], str):
                raise SdevError('Argument must be text', line)
            return args[0].lower()
        builtins['lower'] = SdevBuiltin('lower', lower, 1, 1)
        
        def trim(args, line):
            if len(args) != 1:
                raise SdevError('trim() takes 1 argument', line)
            if not isinstance(args[0], str):
                raise SdevError('Argument must be text', line)
            return args[0].strip()
        builtins['trim'] = SdevBuiltin('trim', trim, 1, 1)
        
        def reverse(args, line):
            if len(args) != 1:
                raise SdevError('reverse() takes 1 argument', line)
            val = args[0]
            if isinstance(val, str):
                return val[::-1]
            if isinstance(val, list):
                return val[::-1]
            raise SdevError('Argument must be text or list', line)
        builtins['reverse'] = SdevBuiltin('reverse', reverse, 1, 1)
        
        def contains(args, line):
            if len(args) != 2:
                raise SdevError('contains() takes 2 arguments', line)
            haystack = args[0]
            needle = args[1]
            if isinstance(haystack, str) and isinstance(needle, str):
                return needle in haystack
            if isinstance(haystack, list):
                return needle in haystack
            if isinstance(haystack, dict):
                return needle in haystack
            raise SdevError('First argument must be text, list, or tome', line)
        builtins['contains'] = SdevBuiltin('contains', contains, 2, 2)
        
        def replace(args, line):
            if len(args) != 3:
                raise SdevError('replace() takes 3 arguments', line)
            text = args[0]
            old = args[1]
            new = args[2]
            if not isinstance(text, str):
                raise SdevError('First argument must be text', line)
            return text.replace(str(old), str(new))
        builtins['replace'] = SdevBuiltin('replace', replace, 3, 3)
        
        def starts(args, line):
            if len(args) != 2:
                raise SdevError('starts() takes 2 arguments', line)
            if not isinstance(args[0], str) or not isinstance(args[1], str):
                raise SdevError('Arguments must be text', line)
            return args[0].startswith(args[1])
        builtins['starts'] = SdevBuiltin('starts', starts, 2, 2)
        
        def ends(args, line):
            if len(args) != 2:
                raise SdevError('ends() takes 2 arguments', line)
            if not isinstance(args[0], str) or not isinstance(args[1], str):
                raise SdevError('Arguments must be text', line)
            return args[0].endswith(args[1])
        builtins['ends'] = SdevBuiltin('ends', ends, 2, 2)
        
        def locate(args, line):
            """Find index of substring or item"""
            if len(args) != 2:
                raise SdevError('locate() takes 2 arguments', line)
            haystack = args[0]
            needle = args[1]
            if isinstance(haystack, str):
                return haystack.find(str(needle))
            if isinstance(haystack, list):
                try:
                    return haystack.index(needle)
                except ValueError:
                    return -1
            raise SdevError('First argument must be text or list', line)
        builtins['locate'] = SdevBuiltin('locate', locate, 2, 2)
        
        def chars(args, line):
            """Convert text to list of characters"""
            if len(args) != 1:
                raise SdevError('chars() takes 1 argument', line)
            if not isinstance(args[0], str):
                raise SdevError('Argument must be text', line)
            return list(args[0])
        builtins['chars'] = SdevBuiltin('chars', chars, 1, 1)
        
        def format_str(args, line):
            """Format a string with values"""
            if len(args) < 1:
                raise SdevError('format() takes at least 1 argument', line)
            template = args[0]
            if not isinstance(template, str):
                raise SdevError('First argument must be text', line)
            values = args[1:]
            try:
                return template.format(*values)
            except (IndexError, KeyError) as e:
                raise SdevError(f"Format error: {e}", line)
        builtins['format'] = SdevBuiltin('format', format_str, 1)
        
        def pad_left(args, line):
            if len(args) < 2 or len(args) > 3:
                raise SdevError('padLeft() takes 2 or 3 arguments', line)
            text = str(args[0])
            width = int(args[1])
            fill = args[2] if len(args) > 2 else ' '
            return text.rjust(width, str(fill)[0])
        builtins['padLeft'] = SdevBuiltin('padLeft', pad_left, 2, 3)
        
        def pad_right(args, line):
            if len(args) < 2 or len(args) > 3:
                raise SdevError('padRight() takes 2 or 3 arguments', line)
            text = str(args[0])
            width = int(args[1])
            fill = args[2] if len(args) > 2 else ' '
            return text.ljust(width, str(fill)[0])
        builtins['padRight'] = SdevBuiltin('padRight', pad_right, 2, 3)
        
        # ========== Dict Functions ==========
        def inscriptions(args, line):
            if len(args) != 1:
                raise SdevError('inscriptions() takes 1 argument', line)
            obj = args[0]
            if not isinstance(obj, dict):
                raise SdevError('Argument must be a tome (dict)', line)
            return list(obj.keys())
        builtins['inscriptions'] = SdevBuiltin('inscriptions', inscriptions, 1, 1)
        
        def contents(args, line):
            if len(args) != 1:
                raise SdevError('contents() takes 1 argument', line)
            obj = args[0]
            if not isinstance(obj, dict):
                raise SdevError('Argument must be a tome (dict)', line)
            return list(obj.values())
        builtins['contents'] = SdevBuiltin('contents', contents, 1, 1)
        
        def entries(args, line):
            if len(args) != 1:
                raise SdevError('entries() takes 1 argument', line)
            obj = args[0]
            if not isinstance(obj, dict):
                raise SdevError('Argument must be a tome (dict)', line)
            return [[k, v] for k, v in obj.items()]
        builtins['entries'] = SdevBuiltin('entries', entries, 1, 1)
        
        def merge(args, line):
            """Merge multiple dicts"""
            result = {}
            for arg in args:
                if not isinstance(arg, dict):
                    raise SdevError('All arguments must be tomes', line)
                result.update(arg)
            return result
        builtins['merge'] = SdevBuiltin('merge', merge, 1)
        
        def erase(args, line):
            """Remove key from dict"""
            if len(args) != 2:
                raise SdevError('erase() takes 2 arguments', line)
            obj = args[0]
            key = args[1]
            if not isinstance(obj, dict):
                raise SdevError('First argument must be a tome', line)
            if key in obj:
                del obj[key]
            return obj
        builtins['erase'] = SdevBuiltin('erase', erase, 2, 2)
        
        # ========== Matrix Operations ==========
        def matrix(args, line):
            if len(args) < 2:
                raise SdevError('matrix() takes at least 2 arguments (rows, cols, fill?)', line)
            rows = int(args[0])
            cols = int(args[1])
            fill = args[2] if len(args) > 2 else 0
            return [[fill for _ in range(cols)] for _ in range(rows)]
        builtins['matrix'] = SdevBuiltin('matrix', matrix, 2, 3)
        
        def identity(args, line):
            """Create identity matrix"""
            if len(args) != 1:
                raise SdevError('identity() takes 1 argument', line)
            n = int(args[0])
            return [[1 if i == j else 0 for j in range(n)] for i in range(n)]
        builtins['identity'] = SdevBuiltin('identity', identity, 1, 1)
        
        def transpose(args, line):
            if len(args) != 1:
                raise SdevError('transpose() takes 1 argument', line)
            m = args[0]
            if not isinstance(m, list) or not all(isinstance(row, list) for row in m):
                raise SdevError('Argument must be a 2D list', line)
            if len(m) == 0:
                return []
            return [[m[j][i] for j in range(len(m))] for i in range(len(m[0]))]
        builtins['transpose'] = SdevBuiltin('transpose', transpose, 1, 1)
        
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
        builtins['dot'] = SdevBuiltin('dot', dot, 2, 2)
        
        def matmul(args, line):
            """Matrix multiplication"""
            if len(args) != 2:
                raise SdevError('matmul() takes 2 arguments', line)
            a, b = args[0], args[1]
            if not isinstance(a, list) or not isinstance(b, list):
                raise SdevError('Arguments must be 2D lists', line)
            if len(a) == 0 or len(b) == 0:
                return []
            if len(a[0]) != len(b):
                raise SdevError('Matrix dimensions incompatible', line)
            result = [[0 for _ in range(len(b[0]))] for _ in range(len(a))]
            for i in range(len(a)):
                for j in range(len(b[0])):
                    for k in range(len(b)):
                        result[i][j] += a[i][k] * b[k][j]
            return result
        builtins['matmul'] = SdevBuiltin('matmul', matmul, 2, 2)
        
        def matadd(args, line):
            """Matrix addition"""
            if len(args) != 2:
                raise SdevError('matadd() takes 2 arguments', line)
            a, b = args[0], args[1]
            if not isinstance(a, list) or not isinstance(b, list):
                raise SdevError('Arguments must be 2D lists', line)
            if len(a) != len(b) or (len(a) > 0 and len(a[0]) != len(b[0])):
                raise SdevError('Matrices must have same dimensions', line)
            return [[a[i][j] + b[i][j] for j in range(len(a[0]))] for i in range(len(a))]
        builtins['matadd'] = SdevBuiltin('matadd', matadd, 2, 2)
        
        def matsub(args, line):
            """Matrix subtraction"""
            if len(args) != 2:
                raise SdevError('matsub() takes 2 arguments', line)
            a, b = args[0], args[1]
            if not isinstance(a, list) or not isinstance(b, list):
                raise SdevError('Arguments must be 2D lists', line)
            if len(a) != len(b) or (len(a) > 0 and len(a[0]) != len(b[0])):
                raise SdevError('Matrices must have same dimensions', line)
            return [[a[i][j] - b[i][j] for j in range(len(a[0]))] for i in range(len(a))]
        builtins['matsub'] = SdevBuiltin('matsub', matsub, 2, 2)
        
        def matscale(args, line):
            """Scale matrix by scalar"""
            if len(args) != 2:
                raise SdevError('matscale() takes 2 arguments', line)
            m, scalar = args[0], args[1]
            if not isinstance(m, list):
                raise SdevError('First argument must be a 2D list', line)
            return [[cell * scalar for cell in row] for row in m]
        builtins['matscale'] = SdevBuiltin('matscale', matscale, 2, 2)
        
        def reshape(args, line):
            """Reshape a flat list to 2D"""
            if len(args) != 3:
                raise SdevError('reshape() takes 3 arguments (list, rows, cols)', line)
            arr = args[0]
            rows = int(args[1])
            cols = int(args[2])
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            if len(arr) != rows * cols:
                raise SdevError('List size must equal rows * cols', line)
            return [arr[i*cols:(i+1)*cols] for i in range(rows)]
        builtins['reshape'] = SdevBuiltin('reshape', reshape, 3, 3)
        
        def flatten(args, line):
            """Flatten a 2D list to 1D"""
            if len(args) != 1:
                raise SdevError('flatten() takes 1 argument', line)
            m = args[0]
            if not isinstance(m, list):
                raise SdevError('Argument must be a list', line)
            result = []
            for item in m:
                if isinstance(item, list):
                    result.extend(item)
                else:
                    result.append(item)
            return result
        builtins['flatten'] = SdevBuiltin('flatten', flatten, 1, 1)
        
        def shape(args, line):
            """Get shape of array/matrix"""
            if len(args) != 1:
                raise SdevError('shape() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                return [1]
            if len(arr) == 0:
                return [0]
            if isinstance(arr[0], list):
                return [len(arr), len(arr[0])]
            return [len(arr)]
        builtins['shape'] = SdevBuiltin('shape', shape, 1, 1)
        
        def sum_list(args, line):
            """Sum all elements in a list"""
            if len(args) != 1:
                raise SdevError('sum() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            total = 0
            for item in arr:
                if isinstance(item, list):
                    total += sum_list([item], line)
                else:
                    total += item
            return total
        builtins['sum'] = SdevBuiltin('sum', sum_list, 1, 1)
        
        def mean(args, line):
            """Calculate mean of list"""
            if len(args) != 1:
                raise SdevError('mean() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            if len(arr) == 0:
                raise SdevError('Cannot calculate mean of empty list', line)
            return sum(arr) / len(arr)
        builtins['mean'] = SdevBuiltin('mean', mean, 1, 1)
        
        # ========== Sorting Functions ==========
        def sort(args, line):
            if len(args) < 1 or len(args) > 2:
                raise SdevError('sort() takes 1 or 2 arguments', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            if len(args) == 2:
                fn = args[1]
                return sorted(arr, key=lambda x: self._call_function(fn, [x], line))
            return sorted(arr)
        builtins['sort'] = SdevBuiltin('sort', sort, 1, 2)
        
        def sortDesc(args, line):
            if len(args) < 1 or len(args) > 2:
                raise SdevError('sortDesc() takes 1 or 2 arguments', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            if len(args) == 2:
                fn = args[1]
                return sorted(arr, key=lambda x: self._call_function(fn, [x], line), reverse=True)
            return sorted(arr, reverse=True)
        builtins['sortDesc'] = SdevBuiltin('sortDesc', sortDesc, 1, 2)
        
        def unique(args, line):
            if len(args) != 1:
                raise SdevError('unique() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            seen = []
            result = []
            for item in arr:
                if item not in seen:
                    seen.append(item)
                    result.append(item)
            return result
        builtins['unique'] = SdevBuiltin('unique', unique, 1, 1)
        
        def count(args, line):
            if len(args) != 2:
                raise SdevError('count() takes 2 arguments', line)
            arr = args[0]
            item = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            return arr.count(item)
        builtins['count'] = SdevBuiltin('count', count, 2, 2)
        
        # ========== Set Operations ==========
        def union(args, line):
            if len(args) != 2:
                raise SdevError('union() takes 2 arguments', line)
            a, b = args[0], args[1]
            if not isinstance(a, list) or not isinstance(b, list):
                raise SdevError('Arguments must be lists', line)
            result = a.copy()
            for item in b:
                if item not in result:
                    result.append(item)
            return result
        builtins['union'] = SdevBuiltin('union', union, 2, 2)
        
        def intersect(args, line):
            if len(args) != 2:
                raise SdevError('intersect() takes 2 arguments', line)
            a, b = args[0], args[1]
            if not isinstance(a, list) or not isinstance(b, list):
                raise SdevError('Arguments must be lists', line)
            return [item for item in a if item in b]
        builtins['intersect'] = SdevBuiltin('intersect', intersect, 2, 2)
        
        def difference(args, line):
            if len(args) != 2:
                raise SdevError('difference() takes 2 arguments', line)
            a, b = args[0], args[1]
            if not isinstance(a, list) or not isinstance(b, list):
                raise SdevError('Arguments must be lists', line)
            return [item for item in a if item not in b]
        builtins['difference'] = SdevBuiltin('difference', difference, 2, 2)
        
        # ========== JSON ==========
        def etch(args, line):
            if len(args) < 1 or len(args) > 2:
                raise SdevError('etch() takes 1 or 2 arguments', line)
            indent = None
            if len(args) == 2:
                indent = int(args[1])
            return json.dumps(args[0], indent=indent, default=str)
        builtins['etch'] = SdevBuiltin('etch', etch, 1, 2)
        
        def unetch(args, line):
            if len(args) != 1:
                raise SdevError('unetch() takes 1 argument', line)
            try:
                return json.loads(args[0])
            except json.JSONDecodeError as e:
                raise SdevError(f'Invalid JSON: {e}', line)
        builtins['unetch'] = SdevBuiltin('unetch', unetch, 1, 1)
        
        # ========== File I/O ==========
        def inscribe(args, line):
            if len(args) != 2:
                raise SdevError('inscribe() takes 2 arguments (path, content)', line)
            path = args[0]
            content = self._stringify(args[1])
            try:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
            except Exception as e:
                raise SdevError(f"Failed to write file: {e}", line)
        builtins['inscribe'] = SdevBuiltin('inscribe', inscribe, 2, 2)
        
        def decipher(args, line):
            if len(args) != 1:
                raise SdevError('decipher() takes 1 argument (path)', line)
            path = args[0]
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    return f.read()
            except Exception as e:
                raise SdevError(f"Failed to read file: {e}", line)
        builtins['decipher'] = SdevBuiltin('decipher', decipher, 1, 1)
        
        def appendFile(args, line):
            if len(args) != 2:
                raise SdevError('appendFile() takes 2 arguments', line)
            path = args[0]
            content = self._stringify(args[1])
            try:
                with open(path, 'a', encoding='utf-8') as f:
                    f.write(content)
                return True
            except Exception as e:
                raise SdevError(f"Failed to append to file: {e}", line)
        builtins['appendFile'] = SdevBuiltin('appendFile', appendFile, 2, 2)
        
        def fileExists(args, line):
            if len(args) != 1:
                raise SdevError('fileExists() takes 1 argument', line)
            return os.path.exists(args[0])
        builtins['fileExists'] = SdevBuiltin('fileExists', fileExists, 1, 1)
        
        def deleteFile(args, line):
            if len(args) != 1:
                raise SdevError('deleteFile() takes 1 argument', line)
            try:
                os.remove(args[0])
                return True
            except Exception as e:
                raise SdevError(f"Failed to delete file: {e}", line)
        builtins['deleteFile'] = SdevBuiltin('deleteFile', deleteFile, 1, 1)
        
        def listDir(args, line):
            if len(args) != 1:
                raise SdevError('listDir() takes 1 argument', line)
            try:
                return os.listdir(args[0])
            except Exception as e:
                raise SdevError(f"Failed to list directory: {e}", line)
        builtins['listDir'] = SdevBuiltin('listDir', listDir, 1, 1)
        
        # ========== Networking ==========
        def fetch(args, line):
            if len(args) < 1:
                raise SdevError('fetch() takes 1 or 2 arguments', line)
            url = args[0]
            options = args[1] if len(args) > 1 else {}
            try:
                method = options.get('method', 'GET') if isinstance(options, dict) else 'GET'
                headers = options.get('headers', {}) if isinstance(options, dict) else {}
                body = options.get('body') if isinstance(options, dict) else None
                
                req = urllib.request.Request(url, method=method)
                for key, value in headers.items():
                    req.add_header(key, value)
                
                if body:
                    if isinstance(body, (dict, list)):
                        body = json.dumps(body).encode('utf-8')
                        req.add_header('Content-Type', 'application/json')
                    else:
                        body = str(body).encode('utf-8')
                    req.data = body
                
                with urllib.request.urlopen(req, timeout=30) as response:
                    content = response.read().decode('utf-8')
                    try:
                        return json.loads(content)
                    except json.JSONDecodeError:
                        return content
            except urllib.error.URLError as e:
                raise SdevError(f"Network error: {e}", line)
            except Exception as e:
                raise SdevError(f"Fetch failed: {e}", line)
        builtins['fetch'] = SdevBuiltin('fetch', fetch, 1, 2)
        
        # ========== Date/Time ==========
        import time as time_module
        import datetime
        
        def now(args, line):
            return time_module.time()
        builtins['now'] = SdevBuiltin('now', now, 0, 0)
        
        def timestamp(args, line):
            return int(time_module.time() * 1000)
        builtins['timestamp'] = SdevBuiltin('timestamp', timestamp, 0, 0)
        
        def formatTime(args, line):
            if len(args) < 1:
                raise SdevError('formatTime() takes 1 or 2 arguments', line)
            ts = args[0]
            fmt = args[1] if len(args) > 1 else '%Y-%m-%d %H:%M:%S'
            return datetime.datetime.fromtimestamp(ts).strftime(fmt)
        builtins['formatTime'] = SdevBuiltin('formatTime', formatTime, 1, 2)
        
        def sleep(args, line):
            if len(args) != 1:
                raise SdevError('sleep() takes 1 argument', line)
            time_module.sleep(args[0])
            return None
        builtins['sleep'] = SdevBuiltin('sleep', sleep, 1, 1)
        
        # ========== Utility ==========
        def version(args, line):
            return __version__
        builtins['version'] = SdevBuiltin('version', version, 0, 0)
        
        def exit_fn(args, line):
            code = int(args[0]) if len(args) > 0 else 0
            sys.exit(code)
        builtins['exit'] = SdevBuiltin('exit', exit_fn, 0, 1)
        
        def input_fn(args, line):
            prompt = self._stringify(args[0]) if len(args) > 0 else ''
            return input(prompt)
        builtins['input'] = SdevBuiltin('input', input_fn, 0, 1)
        
        def debug(args, line):
            """Print debug info about a value"""
            for arg in args:
                self.output(f"[DEBUG] Type: {self._get_type(arg)}, Value: {self._stringify(arg)}")
            return None
        builtins['debug'] = SdevBuiltin('debug', debug)
        
        def assert_fn(args, line):
            if len(args) < 1:
                raise SdevError('assert() takes at least 1 argument', line)
            condition = args[0]
            message = args[1] if len(args) > 1 else 'Assertion failed'
            if not self._is_truthy(condition):
                raise SdevError(str(message), line)
            return True
        builtins['assert'] = SdevBuiltin('assert', assert_fn, 1, 2)
        
        # ========== Ternary helper ==========
        def ternary(args, line):
            if len(args) != 3:
                raise SdevError('Invalid ternary expression', line)
            return args[1] if self._is_truthy(args[0]) else args[2]
        builtins['__ternary__'] = SdevBuiltin('__ternary__', ternary, 3, 3)
        
        # ========== Data Structure Constructors ==========
        def create_set(args, line):
            items = args[0] if len(args) > 0 and isinstance(args[0], list) else []
            return SdevSet(items)
        builtins['Set'] = SdevBuiltin('Set', create_set, 0, 1)
        
        def create_map(args, line):
            m = SdevMap()
            if len(args) > 0 and isinstance(args[0], list):
                for item in args[0]:
                    if isinstance(item, list) and len(item) >= 2:
                        m.set(item[0], item[1])
            return m
        builtins['Map'] = SdevBuiltin('Map', create_map, 0, 1)
        
        def create_queue(args, line):
            q = SdevQueue()
            if len(args) > 0 and isinstance(args[0], list):
                for item in args[0]:
                    q.enqueue(item)
            return q
        builtins['Queue'] = SdevBuiltin('Queue', create_queue, 0, 1)
        
        def create_stack(args, line):
            s = SdevStack()
            if len(args) > 0 and isinstance(args[0], list):
                for item in args[0]:
                    s.push(item)
            return s
        builtins['Stack'] = SdevBuiltin('Stack', create_stack, 0, 1)
        
        def create_linked_list(args, line):
            ll = SdevLinkedList()
            if len(args) > 0 and isinstance(args[0], list):
                for item in args[0]:
                    ll.append(item)
            return ll
        builtins['LinkedList'] = SdevBuiltin('LinkedList', create_linked_list, 0, 1)
        
        # ========== Graphics/Game Dev Functions ==========
        
        # Graphics state tracking (for Python CLI - outputs commands)
        graphics_state = {
            'canvas_width': 800,
            'canvas_height': 600,
            'fill_color': 'white',
            'stroke_color': 'black',
            'stroke_width': 1,
            'fill_enabled': True,
            'stroke_enabled': True,
            'alpha': 1.0,
            'font_family': 'Arial',
            'font_style': 'normal',
            'font_size': 16,
            'text_align_h': 'left',
            'text_align_v': 'alphabetic',
            'turtle': {
                'x': 200, 'y': 200, 'angle': -90,
                'pen_down': True, 'color': '#00ff88', 'width': 2
            },
            'sprites': {},
            'sprite_id': 0,
            'commands': []  # Store graphics commands for batch output
        }
        
        def emit_gfx(cmd):
            """Emit a graphics command (for integration with canvas)"""
            graphics_state['commands'].append(cmd)
            return cmd
        
        # Canvas Setup
        def canvas(args, line):
            if len(args) != 2:
                raise SdevError('canvas() takes 2 arguments (width, height)', line)
            graphics_state['canvas_width'] = args[0]
            graphics_state['canvas_height'] = args[1]
            return emit_gfx({'type': 'canvas', 'width': args[0], 'height': args[1]})
        builtins['canvas'] = SdevBuiltin('canvas', canvas, 2, 2)
        
        def clear(args, line):
            color = args[0] if len(args) > 0 else '#1a1a2e'
            return emit_gfx({'type': 'clear', 'color': str(color)})
        builtins['clear'] = SdevBuiltin('clear', clear, 0, 1)
        
        def background(args, line):
            if len(args) < 1:
                raise SdevError('background() takes at least 1 argument', line)
            return emit_gfx({'type': 'background', 'color': str(args[0])})
        builtins['background'] = SdevBuiltin('background', background, 1, 1)
        
        # Drawing State
        def fill(args, line):
            if len(args) != 1:
                raise SdevError('fill() takes 1 argument (color)', line)
            graphics_state['fill_color'] = str(args[0])
            graphics_state['fill_enabled'] = True
            return emit_gfx({'type': 'fill', 'color': str(args[0])})
        builtins['fill'] = SdevBuiltin('fill', fill, 1, 1)
        
        def noFill(args, line):
            graphics_state['fill_enabled'] = False
            return emit_gfx({'type': 'noFill'})
        builtins['noFill'] = SdevBuiltin('noFill', noFill, 0, 0)
        
        def stroke(args, line):
            if len(args) < 1 or len(args) > 2:
                raise SdevError('stroke() takes 1-2 arguments (color, width?)', line)
            graphics_state['stroke_color'] = str(args[0])
            graphics_state['stroke_width'] = args[1] if len(args) > 1 else 1
            graphics_state['stroke_enabled'] = True
            return emit_gfx({'type': 'stroke', 'color': str(args[0]), 'width': args[1] if len(args) > 1 else 1})
        builtins['stroke'] = SdevBuiltin('stroke', stroke, 1, 2)
        
        def noStroke(args, line):
            graphics_state['stroke_enabled'] = False
            return emit_gfx({'type': 'noStroke'})
        builtins['noStroke'] = SdevBuiltin('noStroke', noStroke, 0, 0)
        
        def lineWidth(args, line):
            if len(args) != 1:
                raise SdevError('lineWidth() takes 1 argument', line)
            graphics_state['stroke_width'] = args[0]
            return emit_gfx({'type': 'lineWidth', 'width': args[0]})
        builtins['lineWidth'] = SdevBuiltin('lineWidth', lineWidth, 1, 1)
        
        def lineCap(args, line):
            if len(args) != 1:
                raise SdevError('lineCap() takes 1 argument (round, square, butt)', line)
            return emit_gfx({'type': 'lineCap', 'cap': str(args[0])})
        builtins['lineCap'] = SdevBuiltin('lineCap', lineCap, 1, 1)
        
        def lineJoin(args, line):
            if len(args) != 1:
                raise SdevError('lineJoin() takes 1 argument (round, bevel, miter)', line)
            return emit_gfx({'type': 'lineJoin', 'join': str(args[0])})
        builtins['lineJoin'] = SdevBuiltin('lineJoin', lineJoin, 1, 1)
        
        def alpha(args, line):
            if len(args) != 1:
                raise SdevError('alpha() takes 1 argument (0-1)', line)
            graphics_state['alpha'] = args[0]
            return emit_gfx({'type': 'alpha', 'value': args[0]})
        builtins['alpha'] = SdevBuiltin('alpha', alpha, 1, 1)
        
        def shadow(args, line):
            if len(args) < 3:
                raise SdevError('shadow() takes 3-4 arguments (color, blur, offsetX, offsetY?)', line)
            return emit_gfx({
                'type': 'shadow', 
                'color': str(args[0]), 
                'blur': args[1],
                'offsetX': args[2],
                'offsetY': args[3] if len(args) > 3 else args[2]
            })
        builtins['shadow'] = SdevBuiltin('shadow', shadow, 3, 4)
        
        def noShadow(args, line):
            return emit_gfx({'type': 'noShadow'})
        builtins['noShadow'] = SdevBuiltin('noShadow', noShadow, 0, 0)
        
        # Basic Shapes
        def rect(args, line):
            if len(args) < 4:
                raise SdevError('rect() takes 4-5 arguments (x, y, w, h, radius?)', line)
            return emit_gfx({'type': 'rect', 'x': args[0], 'y': args[1], 'w': args[2], 'h': args[3], 'radius': args[4] if len(args) > 4 else 0})
        builtins['rect'] = SdevBuiltin('rect', rect, 4, 5)
        
        def circle(args, line):
            if len(args) != 3:
                raise SdevError('circle() takes 3 arguments (x, y, radius)', line)
            return emit_gfx({'type': 'circle', 'x': args[0], 'y': args[1], 'r': args[2]})
        builtins['circle'] = SdevBuiltin('circle', circle, 3, 3)
        
        def ellipse(args, line):
            if len(args) < 4:
                raise SdevError('ellipse() takes 4-5 arguments (x, y, rx, ry, rotation?)', line)
            return emit_gfx({'type': 'ellipse', 'x': args[0], 'y': args[1], 'rx': args[2], 'ry': args[3], 'rotation': args[4] if len(args) > 4 else 0})
        builtins['ellipse'] = SdevBuiltin('ellipse', ellipse, 4, 5)
        
        def arc(args, line):
            if len(args) < 5:
                raise SdevError('arc() takes 5-6 arguments (x, y, radius, startAngle, endAngle, ccw?)', line)
            return emit_gfx({
                'type': 'arc', 
                'x': args[0], 'y': args[1], 
                'r': args[2], 
                'start': args[3], 'end': args[4],
                'ccw': args[5] if len(args) > 5 else False
            })
        builtins['arc'] = SdevBuiltin('arc', arc, 5, 6)
        
        def gfx_line(args, line):
            if len(args) != 4:
                raise SdevError('line() takes 4 arguments (x1, y1, x2, y2)', line)
            return emit_gfx({'type': 'line', 'x1': args[0], 'y1': args[1], 'x2': args[2], 'y2': args[3]})
        builtins['line'] = SdevBuiltin('line', gfx_line, 4, 4)
        
        def point(args, line):
            if len(args) < 2:
                raise SdevError('point() takes 2-3 arguments (x, y, size?)', line)
            return emit_gfx({'type': 'point', 'x': args[0], 'y': args[1], 'size': args[2] if len(args) > 2 else 1})
        builtins['point'] = SdevBuiltin('point', point, 2, 3)
        
        def triangle(args, line):
            if len(args) != 6:
                raise SdevError('triangle() takes 6 arguments (x1, y1, x2, y2, x3, y3)', line)
            return emit_gfx({'type': 'triangle', 'x1': args[0], 'y1': args[1], 'x2': args[2], 'y2': args[3], 'x3': args[4], 'y3': args[5]})
        builtins['triangle'] = SdevBuiltin('triangle', triangle, 6, 6)
        
        def polygon(args, line):
            if len(args) < 1:
                raise SdevError('polygon() takes points [[x,y], ...]', line)
            points = args[0]
            if not isinstance(points, list):
                raise SdevError('polygon() argument must be a list of points', line)
            return emit_gfx({'type': 'polygon', 'points': points})
        builtins['polygon'] = SdevBuiltin('polygon', polygon, 1, 1)
        
        def star(args, line):
            if len(args) < 4:
                raise SdevError('star() takes 4-5 arguments (x, y, outerRadius, innerRadius, points?)', line)
            return emit_gfx({
                'type': 'star', 
                'x': args[0], 'y': args[1], 
                'outer': args[2], 'inner': args[3], 
                'points': args[4] if len(args) > 4 else 5
            })
        builtins['star'] = SdevBuiltin('star', star, 4, 5)
        
        def heart(args, line):
            if len(args) != 3:
                raise SdevError('heart() takes 3 arguments (x, y, size)', line)
            return emit_gfx({'type': 'heart', 'x': args[0], 'y': args[1], 'size': args[2]})
        builtins['heart'] = SdevBuiltin('heart', heart, 3, 3)
        
        # Text
        def text(args, line):
            if len(args) < 3:
                raise SdevError('text() takes 3-4 arguments (str, x, y, size?)', line)
            return emit_gfx({'type': 'text', 'text': str(args[0]), 'x': args[1], 'y': args[2], 'size': args[3] if len(args) > 3 else 16})
        builtins['text'] = SdevBuiltin('text', text, 3, 4)
        
        def textAlign(args, line):
            if len(args) < 1:
                raise SdevError('textAlign() takes 1-2 arguments (horizontal, vertical?)', line)
            graphics_state['text_align_h'] = str(args[0])
            graphics_state['text_align_v'] = str(args[1]) if len(args) > 1 else 'alphabetic'
            return emit_gfx({'type': 'textAlign', 'horizontal': str(args[0]), 'vertical': args[1] if len(args) > 1 else 'alphabetic'})
        builtins['textAlign'] = SdevBuiltin('textAlign', textAlign, 1, 2)
        
        def font(args, line):
            if len(args) < 1:
                raise SdevError('font() takes 1-2 arguments (fontFamily, style?)', line)
            graphics_state['font_family'] = str(args[0])
            graphics_state['font_style'] = str(args[1]) if len(args) > 1 else 'normal'
            return emit_gfx({'type': 'font', 'family': str(args[0]), 'style': args[1] if len(args) > 1 else 'normal'})
        builtins['font'] = SdevBuiltin('font', font, 1, 2)
        
        # Gradients
        def linearGradient(args, line):
            if len(args) < 5:
                raise SdevError('linearGradient() takes 5+ arguments (x1, y1, x2, y2, ...colorStops)', line)
            stops = args[4:]
            return emit_gfx({'type': 'linearGradient', 'x1': args[0], 'y1': args[1], 'x2': args[2], 'y2': args[3], 'stops': stops})
        builtins['linearGradient'] = SdevBuiltin('linearGradient', linearGradient, 5)
        
        def radialGradient(args, line):
            if len(args) < 7:
                raise SdevError('radialGradient() takes 7+ arguments (x1, y1, r1, x2, y2, r2, ...colorStops)', line)
            stops = args[6:]
            return emit_gfx({'type': 'radialGradient', 'x1': args[0], 'y1': args[1], 'r1': args[2], 'x2': args[3], 'y2': args[4], 'r2': args[5], 'stops': stops})
        builtins['radialGradient'] = SdevBuiltin('radialGradient', radialGradient, 7)
        
        # Transformations
        def translate(args, line):
            if len(args) != 2:
                raise SdevError('translate() takes 2 arguments (x, y)', line)
            return emit_gfx({'type': 'translate', 'x': args[0], 'y': args[1]})
        builtins['translate'] = SdevBuiltin('translate', translate, 2, 2)
        
        def rotate(args, line):
            if len(args) != 1:
                raise SdevError('rotate() takes 1 argument (angle in radians)', line)
            return emit_gfx({'type': 'rotate', 'angle': args[0]})
        builtins['rotate'] = SdevBuiltin('rotate', rotate, 1, 1)
        
        def scale(args, line):
            if len(args) < 1:
                raise SdevError('scale() takes 1-2 arguments (x, y?)', line)
            return emit_gfx({'type': 'scale', 'x': args[0], 'y': args[1] if len(args) > 1 else args[0]})
        builtins['scale'] = SdevBuiltin('scale', scale, 1, 2)
        
        def save(args, line):
            return emit_gfx({'type': 'save'})
        builtins['save'] = SdevBuiltin('save', save, 0, 0)
        
        def restore(args, line):
            return emit_gfx({'type': 'restore'})
        builtins['restore'] = SdevBuiltin('restore', restore, 0, 0)
        
        def resetTransform(args, line):
            return emit_gfx({'type': 'resetTransform'})
        builtins['resetTransform'] = SdevBuiltin('resetTransform', resetTransform, 0, 0)
        
        # Path Drawing
        def beginPath(args, line):
            return emit_gfx({'type': 'beginPath'})
        builtins['beginPath'] = SdevBuiltin('beginPath', beginPath, 0, 0)
        
        def closePath(args, line):
            return emit_gfx({'type': 'closePath'})
        builtins['closePath'] = SdevBuiltin('closePath', closePath, 0, 0)
        
        def moveTo(args, line):
            if len(args) != 2:
                raise SdevError('moveTo() takes 2 arguments (x, y)', line)
            return emit_gfx({'type': 'moveTo', 'x': args[0], 'y': args[1]})
        builtins['moveTo'] = SdevBuiltin('moveTo', moveTo, 2, 2)
        
        def lineTo(args, line):
            if len(args) != 2:
                raise SdevError('lineTo() takes 2 arguments (x, y)', line)
            return emit_gfx({'type': 'lineTo', 'x': args[0], 'y': args[1]})
        builtins['lineTo'] = SdevBuiltin('lineTo', lineTo, 2, 2)
        
        def bezierTo(args, line):
            if len(args) != 6:
                raise SdevError('bezierTo() takes 6 arguments (cp1x, cp1y, cp2x, cp2y, x, y)', line)
            return emit_gfx({'type': 'bezierTo', 'cp1x': args[0], 'cp1y': args[1], 'cp2x': args[2], 'cp2y': args[3], 'x': args[4], 'y': args[5]})
        builtins['bezierTo'] = SdevBuiltin('bezierTo', bezierTo, 6, 6)
        
        def quadraticTo(args, line):
            if len(args) != 4:
                raise SdevError('quadraticTo() takes 4 arguments (cpx, cpy, x, y)', line)
            return emit_gfx({'type': 'quadraticTo', 'cpx': args[0], 'cpy': args[1], 'x': args[2], 'y': args[3]})
        builtins['quadraticTo'] = SdevBuiltin('quadraticTo', quadraticTo, 4, 4)
        
        def fillPath(args, line):
            return emit_gfx({'type': 'fillPath'})
        builtins['fillPath'] = SdevBuiltin('fillPath', fillPath, 0, 0)
        
        def strokePath(args, line):
            return emit_gfx({'type': 'strokePath'})
        builtins['strokePath'] = SdevBuiltin('strokePath', strokePath, 0, 0)
        
        # Sprite System
        def createSprite(args, line):
            if len(args) < 4:
                raise SdevError('createSprite() takes 4-5 arguments (x, y, width, height, color?)', line)
            sprite_id = graphics_state['sprite_id']
            graphics_state['sprite_id'] += 1
            sprite = SdevSprite(args[0], args[1], args[2], args[3], args[4] if len(args) > 4 else 'white')
            sprite.id = sprite_id
            graphics_state['sprites'][sprite_id] = sprite
            emit_gfx({'type': 'createSprite', 'sprite': {'id': sprite_id, 'x': args[0], 'y': args[1], 'width': args[2], 'height': args[3], 'color': args[4] if len(args) > 4 else 'white'}})
            return sprite
        builtins['createSprite'] = SdevBuiltin('createSprite', createSprite, 4, 5)
        
        def drawSprite(args, line):
            if len(args) != 1:
                raise SdevError('drawSprite() takes 1 argument (sprite)', line)
            sprite = args[0]
            if not isinstance(sprite, SdevSprite):
                raise SdevError('Invalid sprite', line)
            return emit_gfx({'type': 'drawSprite', 'sprite': {'id': getattr(sprite, 'id', 0), 'x': sprite.x, 'y': sprite.y, 'width': sprite.width, 'height': sprite.height, 'color': sprite.color}})
        builtins['drawSprite'] = SdevBuiltin('drawSprite', drawSprite, 1, 1)
        
        def moveSprite(args, line):
            if len(args) != 3:
                raise SdevError('moveSprite() takes 3 arguments (sprite, dx, dy)', line)
            sprite = args[0]
            if not isinstance(sprite, SdevSprite):
                raise SdevError('Invalid sprite', line)
            sprite.x += args[1]
            sprite.y += args[2]
            return sprite
        builtins['moveSprite'] = SdevBuiltin('moveSprite', moveSprite, 3, 3)
        
        def updateSprite(args, line):
            if len(args) != 1:
                raise SdevError('updateSprite() takes 1 argument (sprite)', line)
            sprite = args[0]
            if not isinstance(sprite, SdevSprite):
                raise SdevError('Invalid sprite', line)
            sprite.x += sprite.vx
            sprite.y += sprite.vy
            return sprite
        builtins['updateSprite'] = SdevBuiltin('updateSprite', updateSprite, 1, 1)
        
        def spriteCollides(args, line):
            if len(args) != 2:
                raise SdevError('spriteCollides() takes 2 arguments (sprite1, sprite2)', line)
            a, b = args[0], args[1]
            if not isinstance(a, SdevSprite) or not isinstance(b, SdevSprite):
                raise SdevError('Invalid sprites', line)
            return a.collidesWith(b)
        builtins['spriteCollides'] = SdevBuiltin('spriteCollides', spriteCollides, 2, 2)
        
        # Turtle Graphics
        def turtle_init(args, line):
            t = graphics_state['turtle']
            t['x'], t['y'], t['angle'] = 200, 200, -90
            t['pen_down'], t['color'], t['width'] = True, '#00ff88', 2
            return emit_gfx({'type': 'turtle_reset'})
        builtins['turtle'] = SdevBuiltin('turtle', turtle_init, 0, 0)
        
        def forward(args, line):
            if len(args) != 1:
                raise SdevError('forward() takes 1 argument (distance)', line)
            t = graphics_state['turtle']
            dist = args[0]
            rad = math.radians(t['angle'])
            new_x = t['x'] + math.cos(rad) * dist
            new_y = t['y'] + math.sin(rad) * dist
            if t['pen_down']:
                emit_gfx({'type': 'turtle_line', 'x1': t['x'], 'y1': t['y'], 'x2': new_x, 'y2': new_y, 'color': t['color'], 'width': t['width']})
            t['x'], t['y'] = new_x, new_y
            return emit_gfx({'type': 'turtle_move', 'x': new_x, 'y': new_y, 'angle': t['angle']})
        builtins['forward'] = SdevBuiltin('forward', forward, 1, 1)
        
        def backward(args, line):
            if len(args) != 1:
                raise SdevError('backward() takes 1 argument (distance)', line)
            t = graphics_state['turtle']
            dist = -args[0]
            rad = math.radians(t['angle'])
            new_x = t['x'] + math.cos(rad) * dist
            new_y = t['y'] + math.sin(rad) * dist
            if t['pen_down']:
                emit_gfx({'type': 'turtle_line', 'x1': t['x'], 'y1': t['y'], 'x2': new_x, 'y2': new_y, 'color': t['color'], 'width': t['width']})
            t['x'], t['y'] = new_x, new_y
            return emit_gfx({'type': 'turtle_move', 'x': new_x, 'y': new_y, 'angle': t['angle']})
        builtins['backward'] = SdevBuiltin('backward', backward, 1, 1)
        
        def left(args, line):
            if len(args) != 1:
                raise SdevError('left() takes 1 argument (degrees)', line)
            t = graphics_state['turtle']
            t['angle'] -= args[0]
            return emit_gfx({'type': 'turtle_move', 'x': t['x'], 'y': t['y'], 'angle': t['angle']})
        builtins['left'] = SdevBuiltin('left', left, 1, 1)
        
        def right(args, line):
            if len(args) != 1:
                raise SdevError('right() takes 1 argument (degrees)', line)
            t = graphics_state['turtle']
            t['angle'] += args[0]
            return emit_gfx({'type': 'turtle_move', 'x': t['x'], 'y': t['y'], 'angle': t['angle']})
        builtins['right'] = SdevBuiltin('right', right, 1, 1)
        
        def penup(args, line):
            graphics_state['turtle']['pen_down'] = False
            return None
        builtins['penup'] = SdevBuiltin('penup', penup, 0, 0)
        
        def pendown(args, line):
            graphics_state['turtle']['pen_down'] = True
            return None
        builtins['pendown'] = SdevBuiltin('pendown', pendown, 0, 0)
        
        def pencolor(args, line):
            if len(args) != 1:
                raise SdevError('pencolor() takes 1 argument (color)', line)
            graphics_state['turtle']['color'] = str(args[0])
            return None
        builtins['pencolor'] = SdevBuiltin('pencolor', pencolor, 1, 1)
        
        def penwidth(args, line):
            if len(args) != 1:
                raise SdevError('penwidth() takes 1 argument (width)', line)
            graphics_state['turtle']['width'] = args[0]
            return None
        builtins['penwidth'] = SdevBuiltin('penwidth', penwidth, 1, 1)
        
        def goto(args, line):
            if len(args) != 2:
                raise SdevError('goto() takes 2 arguments (x, y)', line)
            t = graphics_state['turtle']
            new_x, new_y = args[0], args[1]
            if t['pen_down']:
                emit_gfx({'type': 'turtle_line', 'x1': t['x'], 'y1': t['y'], 'x2': new_x, 'y2': new_y, 'color': t['color'], 'width': t['width']})
            t['x'], t['y'] = new_x, new_y
            return emit_gfx({'type': 'turtle_move', 'x': new_x, 'y': new_y, 'angle': t['angle']})
        builtins['goto'] = SdevBuiltin('goto', goto, 2, 2)
        
        def home(args, line):
            t = graphics_state['turtle']
            if t['pen_down']:
                emit_gfx({'type': 'turtle_line', 'x1': t['x'], 'y1': t['y'], 'x2': 200, 'y2': 200, 'color': t['color'], 'width': t['width']})
            t['x'], t['y'], t['angle'] = 200, 200, -90
            return emit_gfx({'type': 'turtle_move', 'x': 200, 'y': 200, 'angle': -90})
        builtins['home'] = SdevBuiltin('home', home, 0, 0)
        
        def setheading(args, line):
            if len(args) != 1:
                raise SdevError('setheading() takes 1 argument (angle)', line)
            t = graphics_state['turtle']
            t['angle'] = args[0] - 90
            return emit_gfx({'type': 'turtle_move', 'x': t['x'], 'y': t['y'], 'angle': t['angle']})
        builtins['setheading'] = SdevBuiltin('setheading', setheading, 1, 1)
        
        def heading(args, line):
            return (graphics_state['turtle']['angle'] + 90) % 360
        builtins['heading'] = SdevBuiltin('heading', heading, 0, 0)
        
        def pos(args, line):
            t = graphics_state['turtle']
            return [t['x'], t['y']]
        builtins['pos'] = SdevBuiltin('pos', pos, 0, 0)
        
        def turtleCircle(args, line):
            if len(args) < 1:
                raise SdevError('turtleCircle() takes 1-2 arguments (radius, steps?)', line)
            radius = args[0]
            steps = int(args[1]) if len(args) > 1 else 36
            t = graphics_state['turtle']
            angle_step = 360 / steps
            dist = (2 * math.pi * radius) / steps
            for _ in range(steps):
                rad = math.radians(t['angle'])
                new_x = t['x'] + math.cos(rad) * dist
                new_y = t['y'] + math.sin(rad) * dist
                if t['pen_down']:
                    emit_gfx({'type': 'turtle_line', 'x1': t['x'], 'y1': t['y'], 'x2': new_x, 'y2': new_y, 'color': t['color'], 'width': t['width']})
                t['x'], t['y'] = new_x, new_y
                t['angle'] += angle_step
            return emit_gfx({'type': 'turtle_move', 'x': t['x'], 'y': t['y'], 'angle': t['angle']})
        builtins['turtleCircle'] = SdevBuiltin('turtleCircle', turtleCircle, 1, 2)
        
        def dot(args, line):
            size = args[0] if len(args) > 0 else 5
            color = str(args[1]) if len(args) > 1 else graphics_state['turtle']['color']
            t = graphics_state['turtle']
            return emit_gfx({'type': 'turtle_dot', 'x': t['x'], 'y': t['y'], 'size': size, 'color': color})
        builtins['dot'] = SdevBuiltin('dot', dot, 0, 2)
        
        def stamp(args, line):
            t = graphics_state['turtle']
            return emit_gfx({'type': 'turtle_stamp', 'x': t['x'], 'y': t['y'], 'angle': t['angle'], 'color': t['color']})
        builtins['stamp'] = SdevBuiltin('stamp', stamp, 0, 0)
        
        # Color Helpers
        def hue(args, line):
            if len(args) < 1 or len(args) > 3:
                raise SdevError('hue() takes 1-3 arguments (h, s?, l?)', line)
            h = args[0]
            s = args[1] if len(args) > 1 else 100
            l = args[2] if len(args) > 2 else 50
            return f'hsl({h}, {s}%, {l}%)'
        builtins['hue'] = SdevBuiltin('hue', hue, 1, 3)
        
        def hsla(args, line):
            if len(args) != 4:
                raise SdevError('hsla() takes 4 arguments (h, s, l, a)', line)
            return f'hsla({args[0]}, {args[1]}%, {args[2]}%, {args[3]})'
        builtins['hsla'] = SdevBuiltin('hsla', hsla, 4, 4)
        
        def randomColor(args, line):
            h = random.randint(0, 360)
            return f'hsl({h}, 70%, 60%)'
        builtins['randomColor'] = SdevBuiltin('randomColor', randomColor, 0, 0)
        
        # Graphics Math Utilities
        def radians(args, line):
            if len(args) != 1:
                raise SdevError('radians() takes 1 argument (degrees)', line)
            return math.radians(args[0])
        builtins['radians'] = SdevBuiltin('radians', radians, 1, 1)
        
        def degrees(args, line):
            if len(args) != 1:
                raise SdevError('degrees() takes 1 argument (radians)', line)
            return math.degrees(args[0])
        builtins['degrees'] = SdevBuiltin('degrees', degrees, 1, 1)
        
        def mapRange(args, line):
            if len(args) != 5:
                raise SdevError('mapRange() takes 5 arguments (value, inMin, inMax, outMin, outMax)', line)
            value, inMin, inMax, outMin, outMax = args
            return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin))
        builtins['mapRange'] = SdevBuiltin('mapRange', mapRange, 5, 5)
        
        def constrain(args, line):
            if len(args) != 3:
                raise SdevError('constrain() takes 3 arguments (value, min, max)', line)
            value, min_val, max_val = args
            return max(min_val, min(max_val, value))
        builtins['constrain'] = SdevBuiltin('constrain', constrain, 3, 3)
        
        def dist(args, line):
            if len(args) != 4:
                raise SdevError('dist() takes 4 arguments (x1, y1, x2, y2)', line)
            dx = args[2] - args[0]
            dy = args[3] - args[1]
            return math.sqrt(dx * dx + dy * dy)
        builtins['dist'] = SdevBuiltin('dist', dist, 4, 4)
        
        # Get graphics commands (for integration)
        def getGraphicsCommands(args, line):
            cmds = graphics_state['commands'].copy()
            graphics_state['commands'] = []
            return cmds
        builtins['getGraphicsCommands'] = SdevBuiltin('getGraphicsCommands', getGraphicsCommands, 0, 0)
        
        # Legacy Sprite constructor (backwards compatibility)
        def create_sprite_legacy(args, line):
            x = args[0] if len(args) > 0 else 0
            y = args[1] if len(args) > 1 else 0
            w = args[2] if len(args) > 2 else 32
            h = args[3] if len(args) > 3 else 32
            color = args[4] if len(args) > 4 else "white"
            return SdevSprite(x, y, w, h, color)
        builtins['Sprite'] = SdevBuiltin('Sprite', create_sprite_legacy, 0, 5)
        
        def create_vector2(args, line):
            x = args[0] if len(args) > 0 else 0
            y = args[1] if len(args) > 1 else 0
            return SdevVector2(x, y)
        builtins['Vec2'] = SdevBuiltin('Vec2', create_vector2, 0, 2)
        
        def rgb(args, line):
            if len(args) != 3:
                raise SdevError('rgb() takes 3 arguments', line)
            return SdevColor.rgb(args[0], args[1], args[2])
        builtins['rgb'] = SdevBuiltin('rgb', rgb, 3, 3)
        
        def rgba(args, line):
            if len(args) != 4:
                raise SdevError('rgba() takes 4 arguments', line)
            return SdevColor.rgba(args[0], args[1], args[2], args[3])
        builtins['rgba'] = SdevBuiltin('rgba', rgba, 4, 4)
        
        def hsl_color(args, line):
            if len(args) != 3:
                raise SdevError('hsl() takes 3 arguments', line)
            return SdevColor.hsl(args[0], args[1], args[2])
        builtins['hsl'] = SdevBuiltin('hsl', hsl_color, 3, 3)
        
        def hex_color(args, line):
            if len(args) != 1:
                raise SdevError('hex() takes 1 argument', line)
            return SdevColor.hex(args[0])
        builtins['hex'] = SdevBuiltin('hex', hex_color, 1, 1)
        
        def collides(args, line):
            if len(args) != 2:
                raise SdevError('collides() takes 2 arguments', line)
            a, b = args[0], args[1]
            if isinstance(a, SdevSprite) and isinstance(b, SdevSprite):
                return a.collidesWith(b)
            raise SdevError('collides() requires two Sprites', line)
        builtins['collides'] = SdevBuiltin('collides', collides, 2, 2)
        
        def distance(args, line):
            if len(args) == 2:
                a, b = args[0], args[1]
                if isinstance(a, SdevVector2) and isinstance(b, SdevVector2):
                    return a.distance(b)
                if isinstance(a, SdevSprite) and isinstance(b, SdevSprite):
                    return math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)
            if len(args) == 4:
                return math.sqrt((args[2] - args[0])**2 + (args[3] - args[1])**2)
            raise SdevError('distance() takes 2 vectors/sprites or 4 numbers', line)
        builtins['distance'] = SdevBuiltin('distance', distance, 2, 4)
        
        def lerp(args, line):
            if len(args) != 3:
                raise SdevError('lerp() takes 3 arguments (a, b, t)', line)
            a, b, t = args[0], args[1], args[2]
            return a + (b - a) * t
        builtins['lerp'] = SdevBuiltin('lerp', lerp, 3, 3)
        
        def clamp(args, line):
            if len(args) != 3:
                raise SdevError('clamp() takes 3 arguments (value, min, max)', line)
            value, min_val, max_val = args[0], args[1], args[2]
            return max(min_val, min(max_val, value))
        builtins['clamp'] = SdevBuiltin('clamp', clamp, 3, 3)
        
        # ========== Async Helpers ==========
        def delay(args, line):
            if len(args) != 1:
                raise SdevError('delay() takes 1 argument (milliseconds)', line)
            import time
            time.sleep(args[0] / 1000)
            return None
        builtins['delay'] = SdevBuiltin('delay', delay, 1, 1)
        
        def promise(args, line):
            value = args[0] if len(args) > 0 else None
            p = SdevPromise()
            p.value = value
            p.resolved = True
            return p
        builtins['Promise'] = SdevBuiltin('Promise', promise, 0, 1)

        # ───────── UI Toolkit (CLI: logs declarative commands) ─────────
        ui_values: Dict[str, Any] = {}
        def _s(v, fb=''):
            if v is None: return fb
            return v if isinstance(v, str) else str(v)
        def _log(msg): self.output_lines.append('[ui] ' + msg)
        def _simple(fmt):
            return lambda args: (_log(fmt(args)) or None)
        ui_defs = {
            'window':    (lambda a: f'window("{_s(a[0] if a else "sdev App")}", {a[1] if len(a)>1 else 480}, {a[2] if len(a)>2 else 600})', 0, 3),
            'endwindow': (lambda a: 'endwindow', 0, 0),
            'row':       (lambda a: 'row', 0, 0), 'endrow': (lambda a: 'endrow', 0, 0),
            'column':    (lambda a: 'column', 0, 0), 'endcolumn': (lambda a: 'endcolumn', 0, 0),
            'group':     (lambda a: f'group("{_s(a[0] if a else "")}")', 0, 1), 'endgroup': (lambda a: 'endgroup', 0, 0),
            'tabs':      (lambda a: 'tabs', 0, 0), 'endtabs': (lambda a: 'endtabs', 0, 0),
            'tab':       (lambda a: f'tab("{_s(a[0] if a else "Tab")}")', 0, 1), 'endtab': (lambda a: 'endtab', 0, 0),
            'heading':   (lambda a: f'heading("{_s(a[0] if a else "")}", {a[1] if len(a)>1 else 1})', 1, 2),
            'label':     (lambda a: f'label("{_s(a[0] if a else "")}")', 1, 1),
            'paragraph': (lambda a: f'paragraph("{_s(a[0] if a else "")}")', 1, 1),
            'image':     (lambda a: f'image("{_s(a[0] if a else "")}")', 1, 4),
            'divider':   (lambda a: 'divider', 0, 0),
            'spacer':    (lambda a: f'spacer({a[0] if a else 8})', 0, 1),
            'progress':  (lambda a: f'progress({a[0] if a else 0}/{a[1] if len(a)>1 else 100})', 1, 2),
            'menu':      (lambda a: f'menu("{_s(a[0] if a else "Menu")}")', 0, 1), 'endmenu': (lambda a: 'endmenu', 0, 0),
            'show':      (lambda a: 'show()', 0, 0),
        }
        for nm, (fmt, mn, mx) in ui_defs.items():
            builtins[nm] = SdevBuiltin(nm, _simple(fmt), mn, mx)
        def _btn(args):
            label = _s(args[0] if args else 'Button')
            variant = _s(args[2] if len(args) > 2 else 'default')
            _log(f'button("{label}", variant="{variant}")')
            return None
        builtins['button'] = SdevBuiltin('button', _btn, 1, 3)
        def _menuitem(args):
            _log(f'menuitem("{_s(args[0] if args else "")}")')
            return None
        builtins['menuitem'] = SdevBuiltin('menuitem', _menuitem, 1, 2)
        def _input(args):
            k = _s(args[0] if args else '')
            if k and k not in ui_values: ui_values[k] = ''
            _log(f'input(bind="{k}", placeholder="{_s(args[1] if len(args)>1 else "")}")')
            return None
        builtins['input'] = SdevBuiltin('input', _input, 1, 2)
        def _textarea(args):
            k = _s(args[0] if args else '')
            if k and k not in ui_values: ui_values[k] = ''
            _log(f'textarea(bind="{k}", rows={args[2] if len(args)>2 else 4})')
            return None
        builtins['textarea'] = SdevBuiltin('textarea', _textarea, 1, 3)
        def _checkbox(args):
            k = _s(args[0] if args else '')
            if k and k not in ui_values: ui_values[k] = False
            _log(f'checkbox(bind="{k}", label="{_s(args[1] if len(args)>1 else "")}")')
            return None
        builtins['checkbox'] = SdevBuiltin('checkbox', _checkbox, 1, 2)
        def _slider(args):
            k = _s(args[0] if args else '')
            mn_ = args[1] if len(args) > 1 else 0
            mx_ = args[2] if len(args) > 2 else 100
            st_ = args[3] if len(args) > 3 else 1
            if k and k not in ui_values: ui_values[k] = mn_
            _log(f'slider(bind="{k}", {mn_}..{mx_} step {st_})')
            return None
        builtins['slider'] = SdevBuiltin('slider', _slider, 1, 4)
        def _select(args):
            k = _s(args[0] if args else '')
            opts = args[1] if (len(args) > 1 and isinstance(args[1], list)) else []
            opts = [str(o) for o in opts]
            if k and k not in ui_values: ui_values[k] = opts[0] if opts else ''
            _log(f'select(bind="{k}", options={opts})')
            return None
        builtins['select'] = SdevBuiltin('select', _select, 1, 2)
        def _table(args):
            headers = args[0] if (args and isinstance(args[0], list)) else []
            rows = args[1] if (len(args) > 1 and isinstance(args[1], list)) else []
            _log(f'table({headers}, rows={len(rows)})')
            return None
        builtins['table'] = SdevBuiltin('table', _table, 1, 2)
        def _uiget(args):
            k = _s(args[0] if args else '')
            return ui_values.get(k)
        builtins['uiget'] = SdevBuiltin('uiget', _uiget, 1, 1)
        def _uiset(args):
            ui_values[_s(args[0])] = args[1] if len(args) > 1 else None
            return None
        builtins['uiset'] = SdevBuiltin('uiset', _uiset, 2, 2)
        def _alert(args):
            self.output_lines.append('[alert] ' + _s(args[0] if args else ''))
            return None
        builtins['alert'] = SdevBuiltin('alert', _alert, 1, 1)

        return builtins
    
    def _get_type(self, value: Any) -> str:
        if value is None:
            return 'void'
        if isinstance(value, bool):
            return 'truth'
        if isinstance(value, (int, float)):
            return 'number'
        if isinstance(value, str):
            return 'text'
        if isinstance(value, list):
            return 'list'
        if isinstance(value, dict):
            return 'tome'
        if isinstance(value, (SdevBuiltin, SdevUserFunc, SdevLambda, SdevBoundMethod)):
            return 'conjuration'
        if isinstance(value, SdevClass):
            return 'essence'
        if isinstance(value, SdevInstance):
            return value.sdev_class.name
        if isinstance(value, SdevSet):
            return 'set'
        if isinstance(value, SdevMap):
            return 'map'
        if isinstance(value, SdevQueue):
            return 'queue'
        if isinstance(value, SdevStack):
            return 'stack'
        if isinstance(value, SdevLinkedList):
            return 'linkedlist'
        if isinstance(value, SdevSprite):
            return 'sprite'
        if isinstance(value, SdevVector2):
            return 'vector2'
        if isinstance(value, SdevPromise):
            return 'promise'
        return 'mystery'
    
    def _call_function(self, func: Any, args: List[Any], line: int) -> Any:
        if isinstance(func, SdevBuiltin):
            return func.func(args, line)
        if isinstance(func, SdevUserFunc):
            return self._call_user_func(func, args, line)
        if isinstance(func, SdevLambda):
            return self._call_lambda(func, args, line)
        if isinstance(func, SdevBoundMethod):
            return self._call_bound_method(func, args, line)
        if isinstance(func, SdevAsyncFunc):
            return self._call_async_func(func, args, line)
        raise SdevError('Cannot call non-function', line)
    
    def _call_bound_method(self, bound: SdevBoundMethod, args: List[Any], line: int) -> Any:
        method = bound.method
        instance = bound.instance
        if len(args) > len(method.params):
            raise SdevError(f"Method '{method.name}' expects at most {len(method.params)} args, got {len(args)}", line)
        method_env = Environment(method.closure)
        method_env.define('self', instance)
        for i, param in enumerate(method.params):
            if i < len(args):
                method_env.define(param, args[i])
            else:
                method_env.define(param, None)
        try:
            self._execute(method.body, method_env)
            return None
        except ReturnException as e:
            return e.value
    
    def _call_async_func(self, func: SdevAsyncFunc, args: List[Any], line: int) -> SdevPromise:
        if len(args) != len(func.params):
            raise SdevError(f"Async function '{func.name}' expects {len(func.params)} args, got {len(args)}", line)
        func_env = Environment(func.closure)
        for i, param in enumerate(func.params):
            func_env.define(param, args[i])
        promise = SdevPromise()
        try:
            result = None
            try:
                self._execute(func.body, func_env)
            except ReturnException as e:
                result = e.value
            promise.value = result
            promise.resolved = True
        except SdevError as e:
            promise.error = str(e)
            promise.resolved = True
        return promise
    
    def _call_user_func(self, func: SdevUserFunc, args: List[Any], line: int) -> Any:
        if len(args) > len(func.params):
            raise SdevError(f"Function '{func.name}' expects at most {len(func.params)} arguments, got {len(args)}", line)
        func_env = Environment(func.closure)
        for i, param in enumerate(func.params):
            if i < len(args):
                func_env.define(param, args[i])
            else:
                func_env.define(param, None)  # Default to void for missing args
        try:
            self._execute(func.body, func_env)
            return None
        except ReturnException as e:
            return e.value
    
    def _call_lambda(self, func: SdevLambda, args: List[Any], line: int) -> Any:
        if len(args) > len(func.params):
            raise SdevError(f"Lambda expects at most {len(func.params)} arguments, got {len(args)}", line)
        lambda_env = Environment(func.closure)
        for i, param in enumerate(func.params):
            if i < len(args):
                lambda_env.define(param, args[i])
            else:
                lambda_env.define(param, None)
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
        if isinstance(node, SliceExpr):
            return self._execute_slice(node, env)
        if isinstance(node, MemberExpr):
            return self._execute_member(node, env)
        if isinstance(node, ArrayLiteral):
            return [self._execute(el, env) for el in node.elements]
        if isinstance(node, DictLiteral):
            return self._execute_dict(node, env)
        if isinstance(node, LambdaExpr):
            return SdevLambda(node.params, node.body, env)
        
        # OOP Nodes
        if isinstance(node, SelfExpr):
            return env.get('self', node.line)
        if isinstance(node, SuperExpr):
            instance = env.get('self', node.line)
            if not isinstance(instance, SdevInstance):
                raise SdevError("'super' can only be used inside a class method", node.line)
            parent = instance.sdev_class.parent
            if not parent:
                raise SdevError("Class has no parent", node.line)
            if node.method and node.args is not None:
                method = parent.methods.get(node.method)
                if not method:
                    raise SdevError(f"Parent has no method '{node.method}'", node.line)
                args = [self._execute(a, env) for a in node.args]
                bound = SdevBoundMethod(instance, method)
                return self._call_bound_method(bound, args, node.line)
            return parent
        if isinstance(node, NewExpr):
            return self._execute_new(node, env)
        if isinstance(node, ClassDeclaration):
            return self._execute_class_decl(node, env)
        if isinstance(node, AsyncFuncDeclaration):
            return self._execute_async_decl(node, env)
        if isinstance(node, AwaitExpr):
            result = self._execute(node.expression, env)
            if isinstance(result, SdevPromise):
                if result.error:
                    raise SdevError(result.error, node.line)
                return result.value
            return result
        if isinstance(node, SpawnExpr):
            results = [self._execute(e, env) for e in node.expressions]
            return results
        
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
        if isinstance(node, MemberAssignStatement):
            return self._execute_member_assign(node, env)
        if isinstance(node, IfStatement):
            return self._execute_if(node, env)
        if isinstance(node, WhileStatement):
            return self._execute_while(node, env)
        if isinstance(node, ForInStatement):
            return self._execute_for_in(node, env)
        if isinstance(node, TryStatement):
            return self._execute_try(node, env)
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
        
        raise SdevError(f"Unknown node type: {type(node).__name__}", getattr(node, 'line', 0))
    
    def _execute_class_decl(self, node: ClassDeclaration, env: Environment) -> None:
        parent = None
        if node.parent:
            parent = env.get(node.parent, node.line)
            if not isinstance(parent, SdevClass):
                raise SdevError(f"'{node.parent}' is not a class", node.line)
        
        methods = {}
        for m in node.methods:
            methods[m.name] = SdevMethod(m.name, m.params, m.body, m.is_private, env)
        
        static_methods = {}
        for m in node.static_methods:
            static_methods[m.name] = SdevMethod(m.name, m.params, m.body, m.is_private, env)
        
        constructor = None
        if node.constructor:
            c = node.constructor
            constructor = SdevMethod(c.name, c.params, c.body, c.is_private, env)
        
        sdev_class = SdevClass(node.name, parent, methods, static_methods, constructor)
        env.define(node.name, sdev_class)
    
    def _execute_new(self, node: NewExpr, env: Environment) -> SdevInstance:
        sdev_class = env.get(node.class_name, node.line)
        if not isinstance(sdev_class, SdevClass):
            raise SdevError(f"'{node.class_name}' is not a class", node.line)
        
        instance = SdevInstance(sdev_class, {})
        
        # Inherit parent fields
        if sdev_class.parent and sdev_class.parent.constructor:
            pass  # Parent init called via super
        
        # Call constructor
        if sdev_class.constructor:
            args = [self._execute(a, env) for a in node.args]
            bound = SdevBoundMethod(instance, sdev_class.constructor)
            self._call_bound_method(bound, args, node.line)
        
        return instance
    
    def _execute_async_decl(self, node: AsyncFuncDeclaration, env: Environment) -> None:
        func = SdevAsyncFunc(node.name, node.params, node.body, env)
        env.define(node.name, func)
    
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
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                return left - right
            raise SdevError("Cannot use '-' with non-numbers", node.line)
        if op == '*':
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                return left * right
            if isinstance(left, str) and isinstance(right, (int, float)):
                return left * int(right)
            if isinstance(left, (int, float)) and isinstance(right, str):
                return right * int(left)
            if isinstance(left, list) and isinstance(right, (int, float)):
                return left * int(right)
            raise SdevError("Cannot use '*' with these types", node.line)
        if op == '/':
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                if right == 0:
                    raise SdevError('Division by zero', node.line)
                return left / right
            raise SdevError("Cannot use '/' with non-numbers", node.line)
        if op == '%':
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                return left % right
            raise SdevError("Cannot use '%' with non-numbers", node.line)
        if op == '^':
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                return left ** right
            raise SdevError("Cannot use '^' with non-numbers", node.line)
        if op == '<':
            try:
                return left < right
            except TypeError:
                raise SdevError(f"Cannot compare {self._get_type(left)} with {self._get_type(right)}", node.line)
        if op == '>':
            try:
                return left > right
            except TypeError:
                raise SdevError(f"Cannot compare {self._get_type(left)} with {self._get_type(right)}", node.line)
        if op == '<=':
            try:
                return left <= right
            except TypeError:
                raise SdevError(f"Cannot compare {self._get_type(left)} with {self._get_type(right)}", node.line)
        if op == '>=':
            try:
                return left >= right
            except TypeError:
                raise SdevError(f"Cannot compare {self._get_type(left)} with {self._get_type(right)}", node.line)
        if op == 'equals':
            return self._is_equal(left, right)
        if op == 'differs' or op == '<>':
            return not self._is_equal(left, right)
        
        raise SdevError(f"Unknown operator: {op}", node.line)
    
    def _execute_unary(self, node: UnaryExpr, env: Environment) -> Any:
        operand = self._execute(node.operand, env)
        
        if node.operator == '-':
            if not isinstance(operand, (int, float)):
                raise SdevError("Cannot negate non-number", node.line)
            return -operand
        if node.operator == 'isnt':
            return not self._is_truthy(operand)
        
        raise SdevError(f"Unknown unary operator: {node.operator}", node.line)
    
    def _execute_call(self, node: CallExpr, env: Environment) -> Any:
        callee = self._execute(node.callee, env)
        args = [self._execute(arg, env) for arg in node.args]
        
        if isinstance(callee, SdevBuiltin):
            return callee.func(args, node.line)
        if isinstance(callee, SdevUserFunc):
            return self._call_user_func(callee, args, node.line)
        if isinstance(callee, SdevLambda):
            return self._call_lambda(callee, args, node.line)
        if isinstance(callee, SdevBoundMethod):
            return self._call_bound_method(callee, args, node.line)
        if isinstance(callee, SdevAsyncFunc):
            return self._call_async_func(callee, args, node.line)
        if isinstance(callee, SdevClass):
            # Calling a class as a constructor (alternative to 'new')
            instance = SdevInstance(callee, {})
            if callee.constructor:
                bound = SdevBoundMethod(instance, callee.constructor)
                self._call_bound_method(bound, args, node.line)
            return instance
        
        raise SdevError(f'Cannot call {self._get_type(callee)} as a function', node.line)
    
    def _execute_index(self, node: IndexExpr, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        index = self._execute(node.index, env)
        
        if isinstance(obj, list):
            if not isinstance(index, (int, float)):
                raise SdevError('List index must be a number', node.line)
            idx = int(index)
            if idx < -len(obj) or idx >= len(obj):
                raise SdevError('List index out of bounds', node.line)
            return obj[idx]
        
        if isinstance(obj, str):
            if not isinstance(index, (int, float)):
                raise SdevError('String index must be a number', node.line)
            idx = int(index)
            if idx < -len(obj) or idx >= len(obj):
                raise SdevError('String index out of bounds', node.line)
            return obj[idx]
        
        if isinstance(obj, dict):
            key = self._stringify(index) if not isinstance(index, str) else index
            return obj.get(key)
        
        raise SdevError('Cannot index this type', node.line)
    
    def _execute_slice(self, node: SliceExpr, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        start = self._execute(node.start, env) if node.start else None
        end = self._execute(node.end, env) if node.end else None
        step = self._execute(node.step, env) if node.step else None
        
        if isinstance(obj, (list, str)):
            start = int(start) if start is not None else None
            end = int(end) if end is not None else None
            step = int(step) if step is not None else None
            return obj[start:end:step]
        
        raise SdevError('Cannot slice this type', node.line)
    
    def _execute_member(self, node: MemberExpr, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        prop = node.property
        
        if isinstance(obj, dict):
            return obj.get(prop)
        
        if isinstance(obj, SdevInstance):
            if prop in obj.fields:
                return obj.fields[prop]
            # Look for method in class hierarchy
            method = self._find_method(obj.sdev_class, prop)
            if method:
                return SdevBoundMethod(obj, method)
            raise SdevError(f"Instance has no property '{prop}'", node.line)
        
        if isinstance(obj, SdevClass):
            # Static method access
            if prop in obj.static_methods:
                return obj.static_methods[prop]
            raise SdevError(f"Class '{obj.name}' has no static method '{prop}'", node.line)
        
        # Data structure methods
        if isinstance(obj, SdevSet):
            if prop == 'add': return SdevBuiltin('add', lambda a,l: (obj.add(a[0]), obj)[1], 1, 1)
            if prop == 'remove': return SdevBuiltin('remove', lambda a,l: (obj.remove(a[0]), obj)[1], 1, 1)
            if prop == 'has': return SdevBuiltin('has', lambda a,l: obj.has(a[0]), 1, 1)
            if prop == 'size': return SdevBuiltin('size', lambda a,l: obj.size(), 0, 0)
            if prop == 'values': return SdevBuiltin('values', lambda a,l: obj.values(), 0, 0)
        if isinstance(obj, SdevMap):
            if prop == 'set': return SdevBuiltin('set', lambda a,l: (obj.set(a[0], a[1]), obj)[1], 2, 2)
            if prop == 'get': return SdevBuiltin('get', lambda a,l: obj.get(a[0], a[1] if len(a)>1 else None), 1, 2)
            if prop == 'has': return SdevBuiltin('has', lambda a,l: obj.has(a[0]), 1, 1)
            if prop == 'keys': return SdevBuiltin('keys', lambda a,l: obj.keys(), 0, 0)
            if prop == 'values': return SdevBuiltin('values', lambda a,l: obj.values(), 0, 0)
            if prop == 'size': return SdevBuiltin('size', lambda a,l: obj.size(), 0, 0)
        if isinstance(obj, SdevQueue):
            if prop == 'enqueue': return SdevBuiltin('enqueue', lambda a,l: (obj.enqueue(a[0]), obj)[1], 1, 1)
            if prop == 'dequeue': return SdevBuiltin('dequeue', lambda a,l: obj.dequeue(), 0, 0)
            if prop == 'peek': return SdevBuiltin('peek', lambda a,l: obj.peek(), 0, 0)
            if prop == 'size': return SdevBuiltin('size', lambda a,l: obj.size(), 0, 0)
            if prop == 'isEmpty': return SdevBuiltin('isEmpty', lambda a,l: obj.isEmpty(), 0, 0)
        if isinstance(obj, SdevStack):
            if prop == 'push': return SdevBuiltin('push', lambda a,l: (obj.push(a[0]), obj)[1], 1, 1)
            if prop == 'pop': return SdevBuiltin('pop', lambda a,l: obj.pop(), 0, 0)
            if prop == 'peek': return SdevBuiltin('peek', lambda a,l: obj.peek(), 0, 0)
            if prop == 'size': return SdevBuiltin('size', lambda a,l: obj.size(), 0, 0)
        if isinstance(obj, SdevLinkedList):
            if prop == 'append': return SdevBuiltin('append', lambda a,l: (obj.append(a[0]), obj)[1], 1, 1)
            if prop == 'prepend': return SdevBuiltin('prepend', lambda a,l: (obj.prepend(a[0]), obj)[1], 1, 1)
            if prop == 'toList': return SdevBuiltin('toList', lambda a,l: obj.toList(), 0, 0)
            if prop == 'size': return SdevBuiltin('size', lambda a,l: obj.size(), 0, 0)
        if isinstance(obj, SdevSprite):
            if prop in ('x','y','width','height','color','velocity_x','velocity_y','visible','rotation','scale','tag'):
                return getattr(obj, prop)
            if prop == 'move': return SdevBuiltin('move', lambda a,l: (obj.move(a[0],a[1]), obj)[1], 2, 2)
            if prop == 'moveTo': return SdevBuiltin('moveTo', lambda a,l: (obj.moveTo(a[0],a[1]), obj)[1], 2, 2)
            if prop == 'update': return SdevBuiltin('update', lambda a,l: (obj.update(), obj)[1], 0, 0)
        if isinstance(obj, SdevVector2):
            if prop == 'x': return obj.x
            if prop == 'y': return obj.y
            if prop == 'magnitude': return SdevBuiltin('magnitude', lambda a,l: obj.magnitude(), 0, 0)
            if prop == 'normalize': return SdevBuiltin('normalize', lambda a,l: obj.normalize(), 0, 0)
            if prop == 'add': return SdevBuiltin('add', lambda a,l: obj.add(a[0]), 1, 1)
            if prop == 'sub': return SdevBuiltin('sub', lambda a,l: obj.sub(a[0]), 1, 1)
            if prop == 'scale': return SdevBuiltin('scale', lambda a,l: obj.scale(a[0]), 1, 1)
            if prop == 'dot': return SdevBuiltin('dot', lambda a,l: obj.dot(a[0]), 1, 1)
            if prop == 'distance': return SdevBuiltin('distance', lambda a,l: obj.distance(a[0]), 1, 1)
            if prop == 'angle': return SdevBuiltin('angle', lambda a,l: obj.angle(), 0, 0)
            if prop == 'rotate': return SdevBuiltin('rotate', lambda a,l: obj.rotate(a[0]), 1, 1)
        
        # List methods
        if isinstance(obj, list):
            if prop == 'length': return len(obj)
            if prop == 'push': return SdevBuiltin('push', lambda a,l: (obj.append(a[0]), obj)[1], 1, 1)
            if prop == 'pop': return SdevBuiltin('pop', lambda a,l: obj.pop() if obj else None, 0, 0)
            if prop == 'first': return obj[0] if obj else None
            if prop == 'last': return obj[-1] if obj else None
            if prop == 'isEmpty': return len(obj) == 0
        
        # String methods
        if isinstance(obj, str):
            if prop == 'length': return len(obj)
            if prop == 'upper': return SdevBuiltin('upper', lambda a,l: obj.upper(), 0, 0)
            if prop == 'lower': return SdevBuiltin('lower', lambda a,l: obj.lower(), 0, 0)
            if prop == 'trim': return SdevBuiltin('trim', lambda a,l: obj.strip(), 0, 0)
            if prop == 'split': return SdevBuiltin('split', lambda a,l: obj.split(a[0] if a else None), 0, 1)
            if prop == 'chars': return list(obj)
        
        raise SdevError(f'Cannot access property "{prop}" on {self._get_type(obj)}', node.line)
    
    def _execute_dict(self, node: DictLiteral, env: Environment) -> Dict[str, Any]:
        result = {}
        for key_node, value_node in node.entries:
            key = self._execute(key_node, env)
            value = self._execute(value_node, env)
            result[self._stringify(key)] = value
        return result
    
    def _execute_index_assign(self, node: IndexAssignStatement, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        index = self._execute(node.index, env)
        value = self._execute(node.value, env)
        
        if isinstance(obj, list):
            if not isinstance(index, (int, float)):
                raise SdevError('List index must be a number', node.line)
            idx = int(index)
            if idx < -len(obj) or idx >= len(obj):
                raise SdevError('List index out of bounds', node.line)
            obj[idx] = value
            return value
        
        if isinstance(obj, dict):
            key = self._stringify(index) if not isinstance(index, str) else index
            obj[key] = value
            return value
        
        raise SdevError('Cannot assign to index of this type', node.line)
    
    def _execute_member_assign(self, node: MemberAssignStatement, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        value = self._execute(node.value, env)
        
        if isinstance(obj, dict):
            obj[node.property] = value
            return value
        
        if isinstance(obj, SdevInstance):
            obj.fields[node.property] = value
            return value
        
        if isinstance(obj, SdevSprite):
            if hasattr(obj, node.property):
                setattr(obj, node.property, value)
                return value
        
        raise SdevError('Cannot assign property on this type', node.line)
    
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
        
        while self._is_truthy(self._execute(node.condition, env)):
            try:
                result = self._execute(node.body, env)
            except BreakException:
                break
            except ContinueException:
                pass
            
            iterations += 1
            if iterations > self.max_iterations:
                raise SdevError('Maximum loop iterations exceeded (possible infinite loop)', node.line)
        
        return result
    
    def _execute_for_in(self, node: ForInStatement, env: Environment) -> Any:
        iterable = self._execute(node.iterable, env)
        result = None
        
        if not isinstance(iterable, (list, str, dict)):
            raise SdevError('Can only iterate over list, text, or tome', node.line)
        
        items = iterable
        if isinstance(iterable, dict):
            items = list(iterable.keys())
        
        for item in items:
            loop_env = Environment(env)
            loop_env.define(node.var_name, item)
            try:
                result = self._execute(node.body, loop_env)
            except BreakException:
                break
            except ContinueException:
                continue
        
        return result
    
    def _execute_try(self, node: TryStatement, env: Environment) -> Any:
        try:
            return self._execute(node.try_block, env)
        except SdevError as e:
            if node.catch_block:
                catch_env = Environment(env)
                if node.error_var:
                    catch_env.define(node.error_var, str(e))
                return self._execute(node.catch_block, catch_env)
            return None
    
    def _execute_func_decl(self, node: FuncDeclaration, env: Environment) -> None:
        func = SdevUserFunc(node.name, node.params, node.body, env)
        env.define(node.name, func)
    
    def _execute_block(self, node: BlockStatement, env: Environment) -> Any:
        block_env = Environment(env)
        result = None
        for stmt in node.statements:
            result = self._execute(stmt, block_env)
        return result
    
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
    
    def _is_equal(self, a: Any, b: Any) -> bool:
        if a is None and b is None:
            return True
        if a is None or b is None:
            return False
        if isinstance(a, list) and isinstance(b, list):
            if len(a) != len(b):
                return False
            return all(self._is_equal(x, y) for x, y in zip(a, b))
        return a == b
    
    def _find_method(self, sdev_class: SdevClass, name: str) -> Optional[SdevMethod]:
        """Find a method in class hierarchy"""
        if name in sdev_class.methods:
            return sdev_class.methods[name]
        if sdev_class.parent:
            return self._find_method(sdev_class.parent, name)
        return None
    
    def _stringify(self, value: Any) -> str:
        if value is None:
            return 'void'
        if isinstance(value, bool):
            return 'yep' if value else 'nope'
        if isinstance(value, float):
            if value == int(value):
                return str(int(value))
            return str(value)
        if isinstance(value, int):
            return str(value)
        if isinstance(value, (SdevBuiltin, SdevUserFunc, SdevLambda, SdevBoundMethod)):
            return '<conjuration>'
        if isinstance(value, SdevClass):
            return f'<essence {value.name}>'
        if isinstance(value, SdevInstance):
            return f'<{value.sdev_class.name} instance>'
        if isinstance(value, SdevVector2):
            return f'Vec2({value.x}, {value.y})'
        if isinstance(value, SdevSprite):
            return f'Sprite(x={value.x}, y={value.y})'
        if isinstance(value, (SdevSet, SdevMap, SdevQueue, SdevStack, SdevLinkedList)):
            return repr(value)
        if isinstance(value, list):
            return '[' + ', '.join(self._stringify(v) for v in value) + ']'
        if isinstance(value, dict):
            entries = ', '.join(f'{k}: {self._stringify(v)}' for k, v in value.items())
            return ':: ' + entries + ' ;;'
        return str(value)

# ============= Public API =============

def execute(source: str, output_callback: Callable[[str], None] = print) -> Any:
    """Execute sdev source code and return the result"""
    lexer = Lexer(source)
    tokens = lexer.tokenize()
    parser = Parser(tokens)
    program = parser.parse()
    interpreter = Interpreter(output_callback)
    return interpreter.interpret(program)

def run_file(path: str) -> None:
    """Run a sdev file"""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            source = f.read()
        execute(source)
    except FileNotFoundError:
        print(f"Error: File not found: {path}")
        sys.exit(1)
    except SdevError as e:
        print(f"Error: {e}")
        sys.exit(1)

def repl() -> None:
    """Start the sdev REPL"""
    print(f"sdev {__version__} - Interactive REPL")
    print("Type 'exit()' or Ctrl+C to quit\n")
    
    interpreter = Interpreter()
    
    while True:
        try:
            line = input("sdev> ")
            if not line.strip():
                continue
            
            # Multi-line input
            while line.count('::') > line.count(';;'):
                line += '\n' + input("...   ")
            
            lexer = Lexer(line)
            tokens = lexer.tokenize()
            parser = Parser(tokens)
            program = parser.parse()
            result = interpreter.interpret(program)
            
            if result is not None:
                print(interpreter._stringify(result))
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except EOFError:
            print("\nGoodbye!")
            break
        except SdevError as e:
            print(f"Error: {e}")
        except Exception as e:
            print(f"Internal error: {e}")

# ============= Main Entry Point =============

if __name__ == '__main__':
    if len(sys.argv) > 1:
        run_file(sys.argv[1])
    else:
        repl()
